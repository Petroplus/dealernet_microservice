import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { VeiculoApiResponse } from 'src/dealernet/response/veiculo-response';
import { CreateDealernetVehicleDTO } from 'src/dealernet/vehicle/dto/create-vehicle.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { VehicleFilter } from './filters/vehicle.filter';

@Injectable()
export class VehicleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}
  async find(client_id: string, filter: VehicleFilter): Promise<VeiculoApiResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    if (filter.license_plate) {
      return this.dealernet.vehicle.findByPlate(integration.dealernet, filter.license_plate);
    } else if (filter.chassis_number) {
      return this.dealernet.vehicle.findByChassis(integration.dealernet, filter.chassis_number);
    } else {
      throw new BadRequestException('Invalid filter', { description: 'Filtro inválido' });
    }
  }

  async create(client_id: string, dto: CreateDealernetVehicleDTO): Promise<VeiculoApiResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    await this.dealernet.vehicle.create(integration.dealernet, dto);

    return this.dealernet.vehicle.findByPlate(integration.dealernet, dto.Veiculo_Placa);
  }

  async update(client_id: string, dto: CreateDealernetVehicleDTO): Promise<VeiculoApiResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration.dealernet) {
      throw new BadRequestException('Integration not found');
    }
    let vehicle = await this.dealernet.vehicle.findByPlate(integration.dealernet, dto.Veiculo_Placa);

    if (!vehicle) {
      vehicle = await this.dealernet.vehicle.findByChassis(integration.dealernet, dto.Veiculo_Chassi);
    }

    const vehicles = await this.petroplay.integration.findVehicles(integration.client_id);

    const ppsVehicle = vehicles.find((x) => x.version_id == Number(dto.Veiculo_Modelo));
    if (!ppsVehicle)
      throw new BadRequestException('Vehicle not found', {
        description: 'Dê para do veículo não encontrado entre em contato com o suporte',
      });

    const model = await this.dealernet.vehicle
      .findModel(integration.dealernet, { model_id: ppsVehicle.veiculo_codigo })
      .then((data) => data.first());

    if (!model) throw new BadRequestException('Model not found', { description: 'Modelo do veículo não encontrado' });

    const year = await this.dealernet.vehicle
      .findYears(integration.dealernet, { year_model: dto.Veiculo_AnoCodigo.toString() })
      .then((data) => data.first());

    if (!year) throw new BadRequestException('Year not found', { description: 'Ano do veículo não encontrado' });

    const color = await this.dealernet.vehicle
      .findColors(integration.dealernet, { name: dto.Veiculo_CorExterna })
      .then((data) => data.first());

    if (!color) throw new BadRequestException('Color not found', { description: 'Cor do veículo não encontrada' });
    if (!vehicle) {
      await this.dealernet.vehicle.create(integration.dealernet, {
        ...dto,
        Cliente_Documento: dto.Cliente_Documento,
        Veiculo_Chassi: dto.Veiculo_Chassi,
        Veiculo_Placa: dto.Veiculo_Placa,
        Veiculo_Km: dto.Veiculo_Km,
        Veiculo_Modelo: model?.ModeloVeiculo_Codigo,
        Veiculo_CorExterna: color?.Codigo,
        Veiculo_CorInterna: color?.Tipo,
        Veiculo_AnoCodigo: year?.Ano_Codigo,
      });
    } else {
      await this.dealernet.vehicle.update(integration.dealernet, {
        ...dto,
        Veiculo_Codigo: vehicle?.Veiculo?.toString(),
        Cliente_Documento: dto.Cliente_Documento,
        Veiculo_Chassi: dto.Veiculo_Chassi,
        Veiculo_Placa: dto.Veiculo_Placa,
        Veiculo_Km: dto.Veiculo_Km,
        Veiculo_Modelo: model?.ModeloVeiculo_Codigo,
        Veiculo_CorExterna: color?.Codigo,
        Veiculo_CorInterna: color?.Tipo,
        Veiculo_AnoCodigo: year?.Ano_Codigo,
      });
    }

    return await this.dealernet.vehicle.findByPlate(integration.dealernet, dto.Veiculo_Placa);
  }
}
