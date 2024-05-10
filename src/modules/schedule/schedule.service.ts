import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { DealernetSchedule } from 'src/dealernet/schedule/response/schedule-response';
import { IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { CreateOrderDto } from 'src/petroplay/order/dto/create-order.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ScheduleFilter } from './filters/schedule.filters';

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

    const orders = await this.schema(filter);
    for await (const order of orders.chunk(10)) {
      Logger.warn(`Sending ${order.length} orders to Petroplay`);
      await this.petroplay.order.import(order);
    }
  }

  async schema(filter: ScheduleFilter): Promise<CreateOrderDto[]> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');

    const orders: CreateOrderDto[] = [];
    for await (const integration of integrations) {
      const schedules = await this.dialernet.schedule.find(integration.dealernet, filter.start_date, filter.end_date);
      await this.scheduleToOs(integration, schedules).then((data) => orders.push(...data));
    }

    return orders;
  }

  async scheduleToOs(integration: IntegrationResponse, schedules: DealernetSchedule[]): Promise<CreateOrderDto[]> {
    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);

    const orders: CreateOrderDto[] = [];
    for await (const schedule of schedules) {
      const customer = await this.dialernet.customer.findById(integration.dealernet, schedule.ClienteCodigo);
      const address = customer.Endereco?.EnderecoItem;
      const phone = customer.Telefone?.TelefoneItem[0];

      const vehicle = await this.dialernet.vehicleModel
        .findByName(integration.dealernet, schedule.VeiculoModelo)
        .then(({ ModeloVeiculo_Codigo, ModeloVeiculo_Descricao }) =>
          vehicles.find((v) => v.veiculo_codigo == ModeloVeiculo_Codigo && v.veiculo_descricao == ModeloVeiculo_Descricao)
        );

      const dto: CreateOrderDto = {
        clientId: integration.client_id,
        customerName: schedule.ClienteNome,
        customerDocument: schedule.ClienteDocumento.toString().trim(),
        phoneType: 'PHON',
        phoneNumber: phone?.PessoaTelefone_Fone?.toString().trim(),
        email: customer.Pessoa_Email?.toString().trim(),
        addressName: address?.PessoaEndereco_TipoEndereco?.toString().trim(),
        city: address?.PessoaEndereco_Cidade?.toString().trim(),
        state: address?.PessoaEndereco_Estado?.toString().trim(),
        neighborhood: address?.PessoaEndereco_Bairro?.toString().trim(),
        postal_code: address?.PessoaEndereco_CEP?.toString()?.toString().trim(),
        street: address?.PessoaEndereco_Logradouro?.toString().trim(),
        complement: address?.PessoaEndereco_Complemento?.toString().trim(),
        number: address?.PessoaEndereco_Numero?.toString()?.trim(),
        maker_id: vehicle?.maker_id,
        // maker: vehicle.VeiculoMarca_Descricao,
        model_id: vehicle?.model_id,
        // model: schedule.VeiculoModelo,
        version_id: vehicle?.version_id,
        // version: undefined,
        // year: vehicle?.year,
        // fuel: vehicle?.fuel,
        // color: vehicle.Veiculo_CorExternaDescricao,
        licensePlate: schedule.VeiculoPlaca.toString()?.trim().replace('-', '').substring(0, 7) ?? 'BR00000',
        mileage: Number(schedule.VeiculoKM) ?? 0,
        chassisNumber: schedule.VeiculoChassi ?? 'Não Informado',
        type: 'PACKAGE',
        with_checklist: true,
        integrationId: `${schedule.Chave}`,
        integrationData: schedule,
        inspection: schedule.Data.substring(0, 19),
        additionalInformation: `Dealernet
        Nome do consultor: ${schedule.ConsultorNome ?? ''}
        Modelo do veículo: ${schedule.VeiculoModelo ?? ''}
        `,
      };

      orders.push(dto);
    }

    return orders;
  }
}
