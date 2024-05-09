import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ScheduleFilter } from './filters/schedule.filters';
import { DealernetSchedule } from 'src/dealernet/schedule/response/schedule-response';
import { CreateOrderDto } from 'src/petroplay/order/dto/create-order.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dialernet: DealernetService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sync(filter: ScheduleFilter): Promise<void> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');
  }

  async schema(filter: ScheduleFilter): Promise<unknown> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');

    const orders = [];
    for await (const integration of integrations) {
      const schedules = await this.dialernet.schedule.find(integration.dealernet, filter.start_date, filter.end_date);
      orders.push(await this.scheduleToOs(integration, schedules));
    }

    return orders;
  }

  async scheduleToOs(integration: IntegrationResponse, schedules: DealernetSchedule[]): Promise<unknown> {
    const orders: CreateOrderDto[] = [];
    for await (const schedule of schedules) {
      const customer = await this.dialernet.customer.findById(integration.dealernet, schedule.ClienteCodigo);
      const address = customer.Endereco?.EnderecoItem;
      const vehicle = await this.dialernet.vehicle.findVehicleByPlate(integration.dealernet, schedule.VeiculoPlaca);

      const dto: CreateOrderDto = {
        clientId: integration.client_id,
        customerName: schedule.ClienteNome,
        customerDocument: schedule.ClienteDocumento.toString(),
        phoneType: 'PHON',
        phoneNumber: customer.Telefone?.TelefoneItem[0]?.PessoaTelefone_Fone?.toString(),
        email: customer.Pessoa_Email,
        addressName: address.PessoaEndereco_TipoEndereco?.trim(),
        city: address.PessoaEndereco_Cidade?.trim(),
        state: address.PessoaEndereco_Estado?.trim(),
        neighborhood: address.PessoaEndereco_Bairro?.trim(),
        postal_code: address.PessoaEndereco_CEP?.toString()?.trim(),
        street: address.PessoaEndereco_Logradouro?.trim(),
        complement: address.PessoaEndereco_Complemento?.trim(),
        number: address.PessoaEndereco_Numero?.toString()?.trim(),
        maker: vehicle.VeiculoMarca_Descricao,
        model: schedule.VeiculoModelo,
        version: undefined,
        year: undefined,
        fuel: undefined,
        color: vehicle.Veiculo_CorExternaDescricao,
        licensePlate: schedule.VeiculoPlaca?.trim().replace('-', '').substring(0, 7) ?? 'BR00000',
        mileage: Number(schedule.VeiculoKM) ?? 0,
        chassisNumber: schedule.VeiculoChassi ?? 'Não Informado',
        type: 'PACKAGE',
        with_checklist: true,
        integrationId: `${schedule.Chave}`,
        integrationData: schedule,
        inspection: schedule.Data.substring(0, 19),
        additionalInformation: `Dealernet
        Nome do consultor: ${schedule.ConsultorNome ?? ''}
        Marca do veículo: ${vehicle.VeiculoMarca_Descricao ?? ''}
        Modelo do veículo: ${schedule.VeiculoModelo ?? ''}
        Número do motor: ${vehicle.Veiculo_NumeroMotor ?? ''}`,
      };

      orders.push(dto);
    }

    return orders;
  }
}
