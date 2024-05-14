import { ApiProperty } from '@nestjs/swagger';

import { OrderItemEntity } from './order-items.entity';
import { MakerEntity } from './maker.entity';
import { ModelEntity } from './model.entity';
import { VersionEntity } from './version.entity';
import { WebhookEntity } from './webhook.entity';

export class PetroplayOrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: number;

  @ApiProperty()
  customer_vehicle_id: string;

  @ApiProperty()
  mileage: string;

  @ApiProperty()
  vehicle_maker_id: number;

  @ApiProperty()
  vehicle_model_id: number;

  @ApiProperty()
  vehicle_version_id: number;

  @ApiProperty()
  vehicle_year: string;

  @ApiProperty()
  vehicle_color: string;

  @ApiProperty()
  vehicle_chassis_number: string;

  @ApiProperty()
  license_plate: string;

  @ApiProperty()
  customer_name: string;

  @ApiProperty()
  customer_document: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  address_street: string;

  @ApiProperty()
  address_number: string;

  @ApiProperty()
  address_complement: string;

  @ApiProperty()
  address_neighborhood: string;

  @ApiProperty()
  address_city: string;

  @ApiProperty()
  address_state: string;

  @ApiProperty()
  postal_code: string;

  @ApiProperty()
  customer_id: string;

  @ApiProperty()
  client_id: string;

  @ApiProperty()
  conclusion: Date;

  @ApiProperty()
  inspection: Date;

  @ApiProperty()
  prisma: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  signature_custumer: string;

  @ApiProperty()
  signature_consultant: string;

  @ApiProperty()
  signature_mechanic: string;

  @ApiProperty()
  additional_information: string;

  @ApiProperty()
  external_id: string;

  @ApiProperty()
  integration_id: string;

  @ApiProperty()
  integration_budget_id: string;

  @ApiProperty()
  integration_data: any;

  @ApiProperty()
  codeConsultant?: string;

  @ApiProperty()
  os_number?: string;

  @ApiProperty()
  schedule?: string;

  @ApiProperty()
  budget?: string;

  @ApiProperty()
  product_discount: number;

  @ApiProperty()
  product_discount_percentage: number;

  @ApiProperty()
  services_discount: number;

  @ApiProperty()
  services_discount_percentage: number;

  @ApiProperty()
  average_discount: number;

  @ApiProperty()
  maker: MakerEntity;

  @ApiProperty()
  model: ModelEntity;

  @ApiProperty()
  version: VersionEntity;

  @ApiProperty()
  internal_id: number;

  @ApiProperty()
  consultant_id?: string;

  @ApiProperty()
  mechanic_id?: string;

  @ApiProperty()
  created_by?: string;

  @ApiProperty()
  updated_by?: string;

  @ApiProperty()
  vehicle_fuel: string;

  @ApiProperty()
  vehicle_sale_date: Date;

  @ApiProperty()
  has_budget: boolean;

  @ApiProperty()
  signature_os: string;

  @ApiProperty()
  signature_budget: string;

  @ApiProperty()
  nbs_products: any[];

  @ApiProperty()
  app_date: string;

  @ApiProperty()
  romaneio: boolean;

  @ApiProperty()
  checklist_insp: boolean;

  @ApiProperty()
  checklist_mech: boolean;

  @ApiProperty()
  checklist_qual: boolean;

  @ApiProperty()
  signature_stock: string;

  @ApiProperty()
  user_signature_consultant: string;

  @ApiProperty()
  date_signature_consultant: Date;

  @ApiProperty()
  user_signature_mechanic: string;

  @ApiProperty()
  date_signature_mechanic: Date;

  @ApiProperty()
  user_signature_stock: string;

  @ApiProperty()
  date_signature_stock: Date;

  @ApiProperty()
  user_signature_os: string;

  @ApiProperty()
  date_signature_os: Date;

  @ApiProperty()
  user_signature_customer: string;

  @ApiProperty()
  date_signature_customer: Date;

  @ApiProperty()
  metadata_signature_customer: unknown | JSON;

  @ApiProperty()
  cpf_signature_budget: string;

  @ApiProperty()
  user_signature_budget: string;

  @ApiProperty()
  date_signature_budget: Date;

  @ApiProperty()
  metadata_signature_budget: unknown | JSON;

  @ApiProperty({ deprecated: true })
  budget_number?: string;

  @ApiProperty()
  instalments?: number;

  @ApiProperty()
  date_initial_consultant?: Date;

  @ApiProperty()
  date_final_consultant?: Date;

  @ApiProperty()
  date_initial_mech?: Date;

  @ApiProperty()
  date_final_mech?: Date;

  @ApiProperty()
  deleted_at: string;

  @ApiProperty()
  notify_by_email: boolean;

  @ApiProperty()
  notify_by_whatsapp: boolean;

  @ApiProperty()
  whatsapp_number: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  technical_report_review_media_url: string;

  @ApiProperty()
  mech_signature_inventory: string;

  @ApiProperty()
  date_mech_signature_inventory?: Date;

  @ApiProperty()
  user_mech_signature_inventory: string;

  @ApiProperty()
  os_type: OrderOsType;

  @ApiProperty()
  sector: OrderSector;

  @ApiProperty()
  cutomer_requests: any[];

  @ApiProperty()
  budgets: any[];

  @ApiProperty()
  consultant?: any;

  @ApiProperty({ readOnly: true })
  users: any[];

  @ApiProperty()
  items: OrderItemEntity[];

  @ApiProperty()
  additional_products: OrderAditionalProduct[];

  @ApiProperty()
  additional_services: OrderAditionalService[];

  @ApiProperty({ readOnly: true })
  webhooks: WebhookEntity[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class OrderAditionalProduct {
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  is_approved: boolean;
  integration_id: string;
  integration_data: any;
}

export class OrderAditionalService {
  order_id: string;
  service_id: string;
  name: string;
  quantity: number;
  price: number;
  is_approved: boolean;
  integration_id: string;
  integration_data: any;
}

interface OrderOsType {
  created_at: string;
  updated_at: string;
  id: string;
  client_id: string;
  name: string;
  description: any;
  external_id: any;
  status: string;
}

interface OrderSector {
  created_at: string;
  updated_at: string;
  id: string;
  client_id: string;
  name: string;
  description: any;
  external_id: any;
  status: string;
}
