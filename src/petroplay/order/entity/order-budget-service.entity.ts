import { ApiProperty } from '@nestjs/swagger';

import { ClientOsTypeEntity } from './os-type.entity';

export enum OrderItemSourceGroupEnum {
  'bundled_services' = 'bundled_services',
  'services_recommended' = 'services_recommended',
  'services_review' = 'services_review',
  'additional_services' = 'additional_services',
  'customer_request_services' = 'customer_request_services',
}

export type OrderItemSourceGroup = keyof typeof OrderItemSourceGroupEnum;

export class OrderBudgetServiceEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  order_budget_id: string;

  @ApiProperty()
  service_id: string;

  @ApiProperty({ enum: OrderItemSourceGroupEnum })
  source_group: OrderItemSourceGroup;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  order_checklist_id: string;

  @ApiProperty()
  order_checklist_item_id: string;

  @ApiProperty()
  order_checklist_budget_item_id: string;

  @ApiProperty()
  is_recommended: boolean;

  @ApiProperty()
  is_additional: boolean;

  @ApiProperty()
  is_diagnosed: boolean;

  @ApiProperty()
  is_approved: boolean;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  mechanic_id: string;

  @ApiProperty()
  os_type_id: string;

  @ApiProperty()
  sector_id: string;

  @ApiProperty()
  integration_id: string;

  @ApiProperty()
  integration_data: JSON;

  @ApiProperty()
  rejection_of_details: string;

  @ApiProperty()
  is_charged_for: boolean;

  @ApiProperty()
  is_error: boolean;

  @ApiProperty()
  error_details: string;

  @ApiProperty()
  is_quality_rejected: boolean;

  @ApiProperty()
  quality_rejection_details: string;

  @ApiProperty()
  is_quality_adjusted: boolean;

  @ApiProperty()
  is_pre_delivery_rejected: boolean;

  @ApiProperty()
  pre_delivery_rejection_details: string;

  @ApiProperty()
  is_pre_delivery_adjusted: boolean;

  @ApiProperty()
  is_run_of_externally: boolean;

  @ApiProperty({ type: () => ClientOsTypeEntity })
  os_type: ClientOsTypeEntity;

  @ApiProperty()
  mechanic: { cod_consultor: string };

  constructor(partial: Partial<OrderBudgetServiceEntity>) {
    Object.assign(this, partial);
  }
}
