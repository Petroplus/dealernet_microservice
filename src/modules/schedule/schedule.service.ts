import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { DealernetSchedule } from 'src/dealernet/schedule/response/schedule-response';
import { IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { CreateOrderDto } from 'src/petroplay/order/dto/create-order.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { CreateScheduleDto } from './dto/create-schedule';
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
      const schedules = await this.dealernet.schedule.find(integration.dealernet, filter);
      Logger.warn(`Found ${schedules.length} schedules to ${integration.client_id}`);
      await this.scheduleToOs(integration, schedules).then((data) => orders.push(...data));
      Logger.warn(`Schema mounted with success to ${integration.client_id}`);
    }

    return orders;
  }

  async scheduleToOs(integration: IntegrationResponse, schedules: DealernetSchedule[]): Promise<CreateOrderDto[]> {
    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);

    const orders: CreateOrderDto[] = [];
    for await (const schedule of schedules) {
      const customer = await this.dealernet.customer.findById(integration.dealernet, schedule.ClienteCodigo);
      const address = customer.Endereco?.orderBy((x) => x.PessoaEndereco_Codigo, 'desc').first();
      const phone = customer.Telefone?.orderBy((x) => x.PessoaTelefone_Codigo, 'desc').first();

      const veiculo = await this.dealernet.vehicle.findByPlate(integration.dealernet, schedule.VeiculoPlaca);
      const vehicle = vehicles.find(
        (x) => x.veiculo_codigo == veiculo.VeiculoModelo_Codigo && x.veiculo_descricao == veiculo.VeiculoModelo_Descricao,
      );

      const year = await this.dealernet.vehicle
        .findYears(integration.dealernet, { year_code: veiculo.VeiculoAno_Codigo })
        .then((data) => data.first());

      const requests = schedule.Servicos?.map((service, index) => {
        const products = service.Produtos?.map((product) => ({
          product_id: product.ProdutoReferencia,
          service_id: service.TMOReferencia,
          quantity: product.Quantidade,
          price: product.ValorUnitario,
          integration_id: product.ProdutoReferencia,
          integration_data: product,
        }));

        const services = [
          {
            service_id: service.TMOReferencia,
            name: service.Descricao,
            quantity: service.Tempo,
            price: service.ValorUnitario,
            integration_id: service.TMOReferencia,
            integration_data: service,
            products: products,
          },
        ];

        return {
          sequence: index + 1,
          description: service.Descricao,
          notes: service.Observacao,
          is_scheduled: true,
          services: services,
        };
      });

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

      const dto: CreateOrderDto = {
        client_id: integration.client_id,
        customer_name: schedule.ClienteNome,
        customer_document: schedule.ClienteDocumento.toString().trim(),
        phone_number: phone?.PessoaTelefone_Fone?.toString().trim(),
        email: customer.Pessoa_Email?.toString().trim(),
        address: addressDto,
        vehicle_maker_id: vehicle?.maker_id,
        vehicle_model_id: vehicle?.model_id,
        vehicle_version_id: vehicle?.version_id,
        vehicle_year: year?.Ano_Modelo?.toString().trim(),
        vehicle_fuel: vehicle?.fuel,
        vehicle_color: veiculo.Veiculo_CorExternaDescricao,
        vehicle_chassis_number: schedule.VeiculoChassi ?? 'Não Informado',
        license_plate: schedule.VeiculoPlaca.toString()?.trim().replace('-', '').substring(0, 7) ?? 'BR00000',
        mileage: Number(schedule.VeiculoKM) ?? 0,
        type: 'PACKAGE',
        with_checklist: true,
        inspection: schedule.Data.substring(0, 19),
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
}
