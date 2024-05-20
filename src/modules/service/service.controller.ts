import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { ServiceService } from './service.service';
import { DealernetServiceTMOResponse } from 'src/dealernet/service/response/service.response';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServiceFilter } from './filters/service.filter';

@ApiTags('Services (TMO)')
@Controller('services')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Get(':client_id')
  @ApiResponse({ status: 200, type: DealernetServiceTMOResponse, isArray: true })
  @ApiOperation({
    summary: 'Busca uma lista de serviços(TMO) baseado nos filtros informados ',
  })
  async find(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Query() filter: ServiceFilter
  ): Promise<DealernetServiceTMOResponse[]> {
    return this.service.find(client_id, filter);
  }
}
