import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { DealernetSchedule } from 'src/dealernet/schedule/response/schedule-response';
import { IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { CreateOrderDto } from 'src/petroplay/order/dto/create-order.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ScheduleFilter } from './filters/schedule.filter';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService
  ) {}

  @Cron('0 2,4,8 * * *')
  async sync(filter: ScheduleFilter): Promise<void> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');

    for await (const integration of integrations) {
      const toUpsert = await this.schema({ ...filter, client_ids: [integration.client_id] });
      toUpsert.chunk(5).forEach(async (item) => {
        Logger.warn(`Sending ${item.length} orders to Petroplay`);
        await this.petroplay.order.upsert(item).catch((err) => {
          Logger.error('Error on upsert orders', err, 'ScheduleService.sync');
        });
      });
    }
  }

  async schema(filter: ScheduleFilter): Promise<CreateOrderDto[]> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');

    const orders: CreateOrderDto[] = [];
    for await (const integration of integrations) {
      const schedules = await this.dealernet.schedule.find(integration.dealernet, filter.start_date, filter.end_date);
      await this.scheduleToOs(integration, schedules).then((data) => orders.push(...data));
    }

    return orders;
  }

  async scheduleToOs(integration: IntegrationResponse, schedules: DealernetSchedule[]): Promise<CreateOrderDto[]> {
    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);

    const orders: CreateOrderDto[] = [];
    for await (const schedule of schedules) {
      const customer = await this.dealernet.customer.findById(integration.dealernet, schedule.ClienteCodigo);
      const address = customer.Endereco?.EnderecoItem;
      const phone = customer.Telefone?.TelefoneItem[0];

      const vehicle = await this.dealernet.vehicleModel
        .findByName(integration.dealernet, schedule.VeiculoModelo)
        .then(({ ModeloVeiculo_Codigo, ModeloVeiculo_Descricao }) =>
          vehicles.find((v) => v.veiculo_codigo == ModeloVeiculo_Codigo && v.veiculo_descricao == ModeloVeiculo_Descricao)
        );

      const customer_pps = await this.petroplay.customer.findByDocument(
        integration.client_id,
        schedule.ClienteDocumento.toString().trim()
      );

      const dto: CreateOrderDto = {
        client_id: integration.client_id,
        customer_name: schedule.ClienteNome,
        customer_document: schedule.ClienteDocumento.toString().trim(),
        phone_number: phone?.PessoaTelefone_Fone?.toString().trim(),
        email: customer.Pessoa_Email?.toString().trim(),
        // address_name: address?.PessoaEndereco_TipoEndereco?.toString().trim(),
        // city: address?.PessoaEndereco_Cidade?.toString().trim(),
        // state: address?.PessoaEndereco_Estado?.toString().trim(),
        // neighborhood: address?.PessoaEndereco_Bairro?.toString().trim(),
        // postal_code: address?.PessoaEndereco_CEP?.toString()?.toString().trim(),
        // street: address?.PessoaEndereco_Logradouro?.toString().trim(),
        // complement: address?.PessoaEndereco_Complemento?.toString().trim(),
        // number: address?.PessoaEndereco_Numero?.toString()?.trim(),
        vehicle_maker_id: vehicle?.maker_id,
        // maker: vehicle.VeiculoMarca_Descricao,
        vehicle_model_id: vehicle?.model_id,
        // model: schedule.VeiculoModelo,
        vehicle_version_id: vehicle?.version_id,
        // version: undefined,
        // vehicle_year: vehicle?.year,
        // fuel: vehicle?.fuel,
        // color: vehicle.Veiculo_CorExternaDescricao,
        license_plate: schedule.VeiculoPlaca.toString()?.trim().replace('-', '').substring(0, 7) ?? 'BR00000',
        mileage: Number(schedule.VeiculoKM) ?? 0,
        vehicle_chassis_number: schedule.VeiculoChassi ?? 'Não Informado',
        type: 'PACKAGE',
        with_checklist: true,
        integration_id: `${schedule.Chave}`,
        integration_data: schedule,
        inspection: schedule.Data.substring(0, 19),
        additional_information: `Dealernet
        Nome do consultor: ${schedule.ConsultorNome ?? ''}
        Modelo do veículo: ${schedule.VeiculoModelo ?? ''}
        `,
      };
      if (customer_pps) {
        dto.customer_id = customer_pps.id;
      }

      orders.push(dto);
    }

    return orders;
  }
}
