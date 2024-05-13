import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { CustomerService } from './customer.service';
import { CustomerFilter } from './filters/customer.filter';

@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Post()
  @ApiResponse({ status: 200 })
  async create(@Param('client_id', ParseUUIDPipe) client_id: string, @Body() data: unknown): Promise<unknown> {
    return; //this.service.create(client_id, data);
  }

  @Get()
  @ApiResponse({ status: 200 })
  async find(@Param('client_id', ParseUUIDPipe) client_id: string, @Query() filter: CustomerFilter): Promise<unknown> {
    return this.service.find(client_id, filter);
  }

  // @Get(':id')
  // @ApiResponse({ status: 200 })
  // async findById(@Param('client_id', ParseUUIDPipe) client_id: string, @Param('id', ParseUUIDPipe) id: string): Promise<unknown> {
  //   return this.service.findById(client_id, id);
  // }

  @Put(':id')
  @ApiResponse({ status: 200 })
  async update(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: unknown
  ): Promise<unknown> {
    return; //this.service.update(client_id, id, data);
  }
}
