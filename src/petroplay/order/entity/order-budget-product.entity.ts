import { ApiProperty } from '@nestjs/swagger';

import { ClientOsTypeEntity } from './os-type.entity';

export class OrderBudgetProductEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  order_budget_id: string;

  @ApiProperty()
  order_budget_service_id: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  source_group: string;

  @ApiProperty()
  service_id: string;

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
  is_approved: boolean;

  @ApiProperty()
  is_stock_available: boolean;

  @ApiProperty()
  notes: string;

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

  @ApiProperty({ type: () => ClientOsTypeEntity })
  os_type: ClientOsTypeEntity;

  constructor(partial: Partial<OrderBudgetProductEntity>) {
    Object.assign(this, partial);
  }
}
