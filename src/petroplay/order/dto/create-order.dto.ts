import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
export enum FuelEnum {
  Gasolina = 'Gasolina',
  Etanol = 'Etanol',
  Diesel = 'Diesel',
  Elétrico = 'Elétrico',
  Flex = 'Flex',
  Hibrido = 'Hibrido',
}
export enum OrderTypeEnum {
  PACKAGE = 'PACKAGE',
  DIAGNOSIS = 'DIAGNOSIS',
  BUDGET = 'BUDGET',
}

export enum Role {
  SYSA = 'SYSA', // System Administrator
  ADMN = 'ADMN', // Administrator
  DRCT = 'DRCT', // Director
  MNGR = 'MNGR', // Manager
  CONS = 'CONS', // Consultant
  MECH = 'MECH', // Mechanic
  QASS = 'QASS', // Quality Assurance
  CUST = 'CUST', // Customer
  STCK = 'STCK', // Stocker
  CTCH = 'CTCH', // COTECH
  AQPV = 'AQPV', // AQPV
}

export type OrderType = keyof typeof OrderTypeEnum;

export type Fuel = keyof typeof FuelEnum;

export class CreateCustomerRequestProductDto {
  @ApiProperty()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsOptional()
  integration_id: string;

  @ApiProperty()
  @IsOptional()
  integration_data: any;

  constructor(partil?: Partial<CreateCustomerRequestProductDto>) {
    Object.assign(this, partil);
  }
}

export class CreateCustomerRequestServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  service_id: string;

  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsOptional()
  integration_id: string;

  @ApiProperty()
  @IsOptional()
  integration_data: any;

  @ApiProperty()
  @IsOptional()
  is_approved?: boolean;

  constructor(partil?: Partial<CreateCustomerRequestServiceDto>) {
    Object.assign(this, partil);
  }
}
export class UpsertOrderCustomerRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  sequence?: number;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  is_scheduled?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  is_diagnostic?: boolean;

  @ApiProperty({ enum: Role, isArray: true })
  @IsOptional()
  who_confirm?: Role[];

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  date_confirmation?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  user_confirmation_id?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  integration_id?: string;

  @ApiProperty({ required: false, default: false, name: 'integration_data' })
  @IsOptional()
  integration_id_data?: any;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  needs_additional_service_quote?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  repair_parts_available?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  under_warranty?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  vehicle_immobilized?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  needs_technical_visit?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  technical_visit_date?: Date;

  @ApiProperty({ required: false, type: CreateCustomerRequestProductDto, isArray: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerRequestProductDto)
  products?: CreateCustomerRequestProductDto[];

  @ApiProperty({ required: false, type: CreateCustomerRequestServiceDto, isArray: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerRequestServiceDto)
  services?: CreateCustomerRequestServiceDto[];
}

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty()
  @IsOptional()
  customer_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  customer_vehicle_id?: string;

  @ApiProperty()
  customer_name: string;

  @ApiProperty()
  customer_document: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  vehicle_maker_id?: number;

  @ApiProperty()
  @IsOptional()
  vehicle_model_id?: number;

  @ApiProperty()
  @IsOptional()
  vehicle_version_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^\d{4}-[13]$/)
  vehicle_year?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  vehicle_color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  vehicle_chassis_number?: string;

  @ApiProperty({ enum: FuelEnum })
  @IsOptional()
  @IsEnum(FuelEnum)
  vehicle_fuel?: Fuel | FuelEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  vehicle_sale_date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(7)
  license_plate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  mileage?: number | string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  conclusion?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  inspection?: Date | string;

  @ApiProperty({ required: false })
  @IsOptional()
  prisma?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  additional_information?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  has_budget?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  budget?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  external_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  integration_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  integration_budget_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  integration_data?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  app_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  schedule?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  budget_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  os_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  nbs_products?: any;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  romaneio?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  pre_delivery_checklist?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  delivery_checklist?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  verified_info?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  product_discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  product_discount_percentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  services_discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  services_discount_percentage?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  notify_by_Email?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  notify_by_whatsapp?: boolean;

  @ApiProperty({ required: false, example: '+559988888888' })
  @IsOptional()
  whatsapp_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  instalments?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  date_initial_consultant?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  date_final_consultant?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date_initial_mech?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date_final_mech?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  os_type_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  sector_id?: string;

  @ApiProperty({ enum: OrderTypeEnum })
  @IsOptional()
  @IsEnum(OrderTypeEnum)
  type?: OrderType;

  @ApiProperty()
  @IsOptional()
  with_checklist?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  shower?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  wait?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  mobility?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mobility_option?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  date_confirmed?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  created_by?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  updated_by?: string;

  @ApiProperty({ required: false, type: UpsertOrderCustomerRequestDto, isArray: true })
  @IsOptional()
  customer_request?: UpsertOrderCustomerRequestDto[];

  constructor(partial?: Partial<CreateOrderDto>) {
    Object.assign(this, partial);
  }
}
