import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateCustomerDTO } from 'src/dealernet/dto/create-customer.dto';

import { CustomerService } from './customer.service';
import { CustomerFilter } from './filters/customer.filter';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Post(':client_id')
  @ApiResponse({ status: 200 })
  async create(@Param('client_id', ParseUUIDPipe) client_id: string, @Body() dto: CreateCustomerDTO): Promise<void> {
    return this.service.upsert(client_id, dto);
  }

  @Get(':client_id')
  @ApiResponse({ status: 200 })
  async find(@Param('client_id', ParseUUIDPipe) client_id: string, @Query() filter: CustomerFilter): Promise<unknown> {
    return this.service.find(client_id, filter);
  }

  @Put(':client_id')
  @ApiResponse({ status: 200 })
  async update(@Param('client_id', ParseUUIDPipe) client_id: string, @Body() dto: CreateCustomerDTO): Promise<void> {
    return this.service.upsert(client_id, dto);
  }

  @Put(':client_id/customers/:customer_id')
  @ApiResponse({ status: 200 })
  async updateByCustomerId(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Param('customer_id', ParseUUIDPipe) customer_id: string,
  ): Promise<void> {
    return this.service.updateByCustomerId(client_id, customer_id);
  }

  // @Get(':id')
  // @ApiResponse({ status: 200 })
  // async findById(@Param('client_id', ParseUUIDPipe) client_id: string, @Param('id', ParseUUIDPipe) id: string): Promise<unknown> {
  //   return this.service.findById(client_id, id);
  // }
}
