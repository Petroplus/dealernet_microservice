import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isEmail } from 'class-validator';
import { Task } from 'system-x64';

import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { DealernetSchedule } from 'src/dealernet/schedule/response/schedule-response';
import { IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { CreateOrderDto, OrderType } from 'src/petroplay/order/dto/create-order.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { CreateScheduleDto } from './dto/create-schedule';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleFilter } from './filters/schedule.filter';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
    private readonly context: ContextService,
  ) {}

  @Cron('0 2,4,8 * * *')
  async sync(filter: ScheduleFilter): Promise<void> {
    const integrations = await this.petroplay.integration.find({ clients: filter?.client_ids ?? [] });
    if (!integrations) throw new BadRequestException('Integration not found');

    const background = async () => {
      for await (const integration of integrations) {
        const toUpsert = await this.schema({ ...filter, client_ids: [integration.client_id] });
        toUpsert.chunk(5).forEach(async (item) => {
          Logger.warn(`Sending ${item.length} orders to Petroplay`);
          await this.petroplay.order.upsert(item).catch((err) => {
            Logger.error('Error on upsert orders', err, 'ScheduleService.sync');
          });
        });
      }
    };

    background().catch((err) => {
      Logger.error('Error on sync schedule', err, 'ScheduleService.sync');
    });
  }

  async schema(filter: ScheduleFilter): Promise<CreateOrderDto[]> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');

    const orders: CreateOrderDto[] = [];
    for await (const integration of integrations) {
      const schedules = await this.dealernet.schedule.find(integration.dealernet, filter).catch((err) => {
        Logger.error('Error on find schedules', err, 'ScheduleService.schema');
        return [];
      });

      if (!schedules.length) continue;

      Logger.warn(`Found ${schedules.length} schedules to ${integration.client_id}`);
      await this.scheduleToOs(integration, schedules).then((data) => orders.push(...data));
      Logger.warn(`Schema mounted with success to ${integration.client_id}`);
      Task.delay(1000 * 2);
    }

    return orders;
  }

  async scheduleToOs(integration: IntegrationResponse, schedules: DealernetSchedule[]): Promise<CreateOrderDto[]> {
    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);
    const os_types = await this.petroplay.client.findOsTypes(integration.client_id);

    const integration_ids = schedules.map((schedule) => schedule.Chave.toString());
    const pps_orders = await this.petroplay.order.find({ integration_ids });
    const orders: CreateOrderDto[] = [];
    for await (const schedule of schedules) {
      const customer = await this.dealernet.customer.findById(integration.dealernet, schedule.ClienteCodigo);
      const address = customer.Endereco?.orderBy((x) => x.PessoaEndereco_Codigo, 'desc').first();
      const phone = customer.Telefone?.orderBy((x) => x.PessoaTelefone_Codigo, 'desc').first();

      const veiculo = await this.dealernet.vehicle.findByPlate(integration.dealernet, schedule.VeiculoPlaca);
      if (!veiculo) {
        Logger.warn(`Vehicle not found on Dealernet ${schedule.VeiculoPlaca}`, 'ScheduleService.scheduleToOs');
      }

      const vehicle = vehicles.find(
        (x) => x.veiculo_codigo == veiculo?.VeiculoModelo_Codigo && x.veiculo_descricao == veiculo?.VeiculoModelo_Descricao,
      );

      const year = await this.dealernet.vehicle
        .findYears(integration.dealernet, { year_code: veiculo?.VeiculoAno_Codigo })
        .then((data) => data.first());

      const requests = [];

      // Verifica se está habilitado a importação de solicitações de clientes
      if (integration.config.import_customer_request_of_dms_enable) {
        schedule.Servicos?.forEach((service, index) => {
          const os_type = os_types.find((x) => x.external_id == service.TipoOSSigla);

          const products = service.Produtos?.map((product) => ({
            service_id: service.TMOReferencia,
            product_id: product.ProdutoReferencia,
            name: product.Descricao,
            quantity: product.Quantidade,
            price: product.ValorUnitario,
            os_type_id: os_type?.id,
            integration_id: product.ProdutoReferencia,
            integration_data: product,
          }));

          delete service.Produtos;
          const services = [];

          // Verifica se está habilitado a importação de serviços das solicitações de clientes
          if (integration.config.import_customer_request_services_of_dms_enable) {
            services.push({
              service_id: service.TMOReferencia,
              name: service.Descricao,
              quantity: service.Tempo,
              price: service.ValorUnitario,
              os_type_id: os_type?.id,
              integration_id: service.TMOReferencia,
              integration_data: service,
              products: products,
            });
          }

          requests.push({
            sequence: index + 1,
            description: String.isEmpty(service.Observacao) ? service.Descricao : service.Observacao,
            notes: service.Descricao,
            is_scheduled: true,
            integration_id: service.Chave,
            integration_data: service,
            services: services,
          });
        });
      }

      const addressDto = {
        address_name: 'Principal',
        street: address?.PessoaEndereco_Logradouro?.toString().trim(),
        number: address?.PessoaEndereco_Numero?.toString()?.trim() ?? 'S/N',
        complement: address?.PessoaEndereco_Complemento?.toString().trim(),
        neighborhood: address?.PessoaEndereco_Bairro?.toString().trim(),
        city: address?.PessoaEndereco_Cidade?.toString().trim(),
        state: address?.PessoaEndereco_Estado?.toString().trim(),
        postal_code: address?.PessoaEndereco_CEP?.toString()?.toString().trim(),
      };

      const order = pps_orders?.find((pps_order) => pps_order?.integration_id == schedule?.Chave.toString());
      const inspection = schedule.Data.substring(0, 19);
      const schedule_date = new Date(schedule.Data).addHours(3);
      if (order) {
        const dto: CreateOrderDto = {
          client_id: order.client_id,
          customer_name: order.customer_name,
          customer_document: order.customer_document,
          phone_number: order.phone_number,
          email: order.email,
          vehicle_maker_id: order?.vehicle_maker_id,
          vehicle_model_id: order?.vehicle_model_id,
          vehicle_version_id: order?.vehicle_version_id,
          vehicle_year: order?.vehicle_year,
          vehicle_fuel: order?.vehicle_fuel,
          vehicle_color: order?.vehicle_color,
          vehicle_chassis_number: order?.vehicle_chassis_number,
          vehicle_schedule_mileage: Number(schedule?.VeiculoKM ?? '0'),
          license_plate: order?.license_plate,
          mileage: order?.mileage,
          type: order.type,
          with_checklist: order.with_checklist,
          os_type_id: order.os_type_id,
          inspection: inspection,
          schedule_date: schedule_date,
          integration_id: order.integration_id,
          integration_data: schedule,
          customer_requests: requests,
          notes: order.notes,
          additional_information: order.additional_information,
        };

        orders.push(dto);
      } else {
        const dto: CreateOrderDto = {
          client_id: integration.client_id,
          customer_name: schedule.ClienteNome,
          customer_document: schedule.ClienteDocumento.toString().trim(),
          phone_number: phone?.PessoaTelefone_Fone?.toString().trim(),
          email: isEmail(customer.Pessoa_Email) ? customer.Pessoa_Email?.toString().trim() : 'contato@petroplay.com.br',
          address: addressDto,
          vehicle_maker_id: vehicle?.maker_id,
          vehicle_model_id: vehicle?.model_id,
          vehicle_version_id: vehicle?.version_id,
          vehicle_year: year?.Ano_Modelo?.toString().trim(),
          vehicle_fuel: vehicle?.fuel,
          vehicle_color: veiculo?.Veiculo_CorExternaDescricao,
          vehicle_chassis_number: schedule.VeiculoChassi ?? 'Não Informado',
          vehicle_schedule_mileage: Number(schedule?.VeiculoKM ?? '0'),
          license_plate: schedule.VeiculoPlaca.toString()?.trim().replace('-', '').substring(0, 7) ?? 'BR00000',
          mileage: Number(schedule?.VeiculoKM ?? '0'),
          type: 'PACKAGE',
          with_checklist: true,
          os_type_id: requests?.first()?.services?.first()?.os_type_id,
          inspection: inspection,
          schedule_date: schedule_date,
          integration_id: `${schedule.Chave}`,
          integration_data: schedule,
          customer_requests: requests,
          notes: schedule.Observacao,
          additional_information: `Dealernet
        Nome do consultor: ${schedule.ConsultorNome ?? ''}
        Modelo do veículo: ${schedule.VeiculoModelo ?? ''}
        `,
        };
        orders.push(dto);
      }
    }

    return orders;
  }

  async create(client_id: string, dto: CreateScheduleDto): Promise<DealernetSchedule> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');
    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);

    const vehicle = await this.dealernet.vehicle.findByPlate(integration.dealernet, dto.VeiculoPlaca);

    if (!vehicle) {
      const ppsVehicle = vehicles.find((x) => x.version_id == dto.version_id);
      if (!ppsVehicle)
        throw new BadRequestException('Vehicle not found', {
          description: 'Dê para do veículo não encontrado entre em contato com o suporte',
        });

      const model = await this.dealernet.vehicle
        .findModel(integration.dealernet, { model_id: ppsVehicle.veiculo_codigo })
        .then((data) => data.first());

      if (!model) throw new BadRequestException('Model not found', { description: 'Modelo do veículo não encontrado' });

      const year = await this.dealernet.vehicle
        .findYears(integration.dealernet, { year_model: dto.VeiculoAno })
        .then((data) => data.first());

      if (!year) throw new BadRequestException('Year not found', { description: 'Ano do veículo não encontrado' });

      const color = await this.dealernet.vehicle
        .findColors(integration.dealernet, { name: dto.VeiculoColor })
        .then((data) => data.first());

      if (!color) throw new BadRequestException('Color not found', { description: 'Cor do veículo não encontrada' });

      await this.dealernet.vehicle.create(integration.dealernet, {
        Cliente_Documento: dto.ClienteDocumento,
        Veiculo_Chassi: dto.VeiculoChassi,
        Veiculo_Placa: dto.VeiculoPlaca,
        Veiculo_Km: dto.VeiculoKM,
        Veiculo_Modelo: model?.ModeloVeiculo_Codigo,
        Veiculo_CorExterna: color?.Codigo,
        Veiculo_CorInterna: color?.Tipo,
        Veiculo_AnoCodigo: year?.Ano_Codigo,
      });
    }

    return this.dealernet.schedule.upsert(integration.dealernet, {
      ...dto,
      ConsultorDocumento: dto.ConsultorDocumento ?? this.context.currentUser().cod_consultor,
    });
  }

  async update(client_id: string, dto: UpdateScheduleDto): Promise<DealernetSchedule> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');
    const old_schedule = await this.dealernet.schedule.find(integration.dealernet, {
      schedule_id: dto.integration_id.toString(),
    });
    if (!old_schedule) throw new BadRequestException(`Schedule integration_id:${dto.integration_id} not found`);
    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);

    const vehicle = await this.dealernet.vehicle.findByPlate(integration.dealernet, dto.VeiculoPlaca);
    if (!vehicle) {
      const ppsVehicle = vehicles.find((x) => x.version_id == dto.version_id);
      if (!ppsVehicle)
        throw new BadRequestException('Vehicle not found', {
          description: 'Dê para do veículo não encontrado entre em contato com o suporte',
        });

      const model = await this.dealernet.vehicle
        .findModel(integration.dealernet, { model_id: ppsVehicle.veiculo_codigo })
        .then((data) => data.first());

      if (!model) throw new BadRequestException('Model not found', { description: 'Modelo do veículo não encontrado' });

      const year = await this.dealernet.vehicle
        .findYears(integration.dealernet, { year_model: dto.VeiculoAno })
        .then((data) => data.first());

      if (!year) throw new BadRequestException('Year not found', { description: 'Ano do veículo não encontrado' });

      const color = await this.dealernet.vehicle
        .findColors(integration.dealernet, { name: dto.VeiculoColor })
        .then((data) => data.first());

      if (!color) throw new BadRequestException('Color not found', { description: 'Cor do veículo não encontrada' });

      await this.dealernet.vehicle.create(integration.dealernet, {
        Cliente_Documento: dto.ClienteDocumento,
        Veiculo_Chassi: dto.VeiculoChassi,
        Veiculo_Placa: dto.VeiculoPlaca,
        Veiculo_Km: dto.VeiculoKM,
        Veiculo_Modelo: model?.ModeloVeiculo_Codigo,
        Veiculo_CorExterna: color?.Codigo,
        Veiculo_CorInterna: color?.Tipo,
        Veiculo_AnoCodigo: year?.Ano_Codigo,
      });
    }

    return this.dealernet.schedule.update(integration.dealernet, {
      VeiculoChassi: dto?.VeiculoChassi ?? old_schedule[0]?.VeiculoChassi,
      VeiculoPlaca: dto?.VeiculoPlaca ?? old_schedule[0]?.VeiculoPlaca,
      VeiculoKM: dto.VeiculoKM ?? old_schedule[0]?.VeiculoKM.toString(),
      VeiculoAno: dto.VeiculoAno ?? old_schedule[0]?.VeiculoAnoCodigo.toString() ?? vehicle.VeiculoAno_Codigo.toString(),
      VeiculoColor: dto.VeiculoColor ?? vehicle.Veiculo_CorExterna.toString(),
      ClienteNome: dto.ClienteNome ?? old_schedule[0]?.ClienteNome,
      ClienteDocumento: dto.ClienteDocumento ?? old_schedule[0]?.ClienteDocumento.toString(),
      Data: dto.Data ?? old_schedule[0]?.Data,
      DataInicial: dto.DataInicial,
      DataFinal: dto.DataFinal,
      TipoOSSigla: dto.TipoOSSigla,
      Observacao: dto.Observacao ?? old_schedule[0]?.Observacao,
      Servicos: dto.Servicos,
      ConsultorDocumento:
        dto.ConsultorDocumento ?? this.context.currentUser()?.cod_consultor ?? old_schedule[0].ConsultorDocumento.toString(),
      maker_id: dto.maker_id,
      model_id: dto.model_id,
      version_id: dto.version_id,
      integration_id: dto.integration_id,
    });
  }
}
