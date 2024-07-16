import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { VeiculoApiResponse } from 'src/dealernet/response/veiculo-response';
import { CreateDealernetVehicleDTO } from 'src/dealernet/vehicle/dto/create-vehicle.dto';

import { VehicleFilter } from './filters/vehicle.filter';
import { VehicleService } from './vehicle.service';

@ApiTags('Vehicles')
@Controller('vehicles/:client_id')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  @Get()
  @ApiResponse({ status: 200, type: VeiculoApiResponse })
  @ApiOperation({ summary: 'Busca o veículo baseado na placa informada ' })
  async find(@Param('client_id', ParseUUIDPipe) client_id: string, @Query() filter: VehicleFilter): Promise<VeiculoApiResponse> {
    return this.service.find(client_id, filter);
  }

  @Post()
  @ApiResponse({ status: 200, type: VeiculoApiResponse })
  @ApiOperation({ summary: 'Cria um veículo utilizando o body informado ' })
  async create(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateDealernetVehicleDTO,
  ): Promise<VeiculoApiResponse> {
    return this.service.create(client_id, dto);
  }

  @Put()
  @ApiResponse({ status: 200, type: VeiculoApiResponse })
  @ApiOperation({ summary: 'Atualiza um veículo utilizando o body informado, caso não exista cria o veículo' })
  async update(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateDealernetVehicleDTO,
  ): Promise<VeiculoApiResponse> {
    console.log(dto, 'teste');
    return this.service.update(client_id, dto);
  }
}
