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
    if (!integration) throw new BadRequestException('Integration not found');

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
    if (!integration) throw new BadRequestException('Integration not found');

    await this.dealernet.vehicle.create(integration.dealernet, dto);

    return this.dealernet.vehicle.findByPlate(integration.dealernet, dto.Veiculo_Placa);
  }
}
