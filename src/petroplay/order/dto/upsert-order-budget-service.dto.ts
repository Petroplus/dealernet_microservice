import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';

import { OrderItemSourceGroup, OrderItemSourceGroupEnum } from '../entity/order-budget-service.entity';
import { OrderBudgetServiceEnum, OrderBudgetServiceType } from '../enum/order-budget-service.enum';

export class UpsertOrderBudgetServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  service_id: string;

  @ApiProperty({ required: false, enum: OrderItemSourceGroupEnum })
  @IsOptional()
  source_group?: OrderItemSourceGroup;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false, enum: OrderBudgetServiceEnum })
  @IsOptional()
  @IsEnum(OrderBudgetServiceEnum)
  type?: OrderBudgetServiceType;

  @ApiProperty({ required: false })
  @IsOptional()
  is_recommended?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  is_additional?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  is_diagnosed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  is_approved?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  mechanic_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  os_type_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  sector_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  order_checklist_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  order_checklist_item_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  order_checklist_budget_item_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4', { each: true })
  order_customer_request_ids?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  integration_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  integration_data?: JSON;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_charged_for?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  rejection_of_details?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_error?: boolean;

  @ApiProperty()
  @IsOptional()
  error_details?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_quality_rejected?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  quality_rejection_details?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_quality_adjusted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_pre_delivery_rejected?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  pre_delivery_rejection_details?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_pre_delivery_adjusted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_run_of_externally?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_finished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_canceled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  reason_for_cancel?: string;
}
