import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpsertOrderDto extends PartialType(CreateOrderDto) {}
