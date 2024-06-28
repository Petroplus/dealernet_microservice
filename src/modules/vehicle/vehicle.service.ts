import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { VeiculoApiResponse } from 'src/dealernet/response/veiculo-response';
import { CreateDealernetVehicleDTO } from 'src/dealernet/vehicle/dto/create-vehicle.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}
  async findByPlate(client_id: string, plate: string): Promise<VeiculoApiResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return this.dealernet.vehicle.findByPlate(integration.dealernet, plate);
  }

  async create(client_id: string, dto: CreateDealernetVehicleDTO): Promise<VeiculoApiResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    await this.dealernet.vehicle.create(integration.dealernet, dto);

    return this.dealernet.vehicle.findByPlate(integration.dealernet, dto.Veiculo_Placa);
  }
}
