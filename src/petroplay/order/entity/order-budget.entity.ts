import { ApiProperty } from '@nestjs/swagger';
import { OrderBudgetProductEntity } from './order-budget-product.entity';
import { OrderBudgetServiceEntity } from './order-budget-service.entity';
import { ClientOsTypeEntity } from './os-type.entity';


export class OrderBudgetEntity  {
  @ApiProperty()
  id: string;

  @ApiProperty()
  internal_id: number;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  os_number: string;

  @ApiProperty()
  budget_number: string;

  @ApiProperty()
  signature_budget: string;

  @ApiProperty()
  user_signature_budget: string;

  @ApiProperty()
  date_signature_budget: Date;

  @ApiProperty()
  is_additional_budget: boolean;

  @ApiProperty()

  os_type_id: string;

  @ApiProperty()
  sector_id: string;

  @ApiProperty()
  integration_id: string;

  @ApiProperty()
  integration_data: JSON;

  @ApiProperty()
  metadata_signature_budget: unknown | JSON;

  @ApiProperty({ type: () => [OrderBudgetProductEntity] })
  products: OrderBudgetProductEntity[];

  @ApiProperty({ type: () => [OrderBudgetServiceEntity] })
  services: OrderBudgetServiceEntity[];

  @ApiProperty({ type: () => ClientOsTypeEntity })
  os_type: ClientOsTypeEntity;

  constructor(partial: Partial<OrderBudgetEntity>) {
    Object.assign(this, partial);
  }
}
