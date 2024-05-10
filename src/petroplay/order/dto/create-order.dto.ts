export class CreateOrderDto {
  clientId: string;
  customerName: string;
  customerDocument: string;
  phoneType: 'PHON';
  phoneNumber: string;
  email: string;
  addressName: string;
  city: string;
  state: string;
  neighborhood: string;
  postal_code: string;
  street: string;
  complement: string;
  number: string;
  maker_id?: number;
  maker?: string;
  model_id?: number;
  model?: string;
  version_id?: number;
  version?: string;
  year?: string | number;
  fuel?: string;
  color?: string;
  licensePlate: string;
  mileage: number;
  chassisNumber: string;
  type: string;
  with_checklist: boolean;
  conclusion?: Date;
  inspection?: string;
  date_confirmed?: string;
  prisma?: string;
  externalId?: string;
  integrationId?: string;
  integrationData?: unknown;
  additionalInformation?: string;
  webhooks?: { callbak: string; method: string; field: string; olderValue: string[]; newValue: string[] }[];
  customer_requests?: CreateCustomerRequestDto[];
}

export class CreateCustomerRequestDto {
  description: string;
  node?: string;
  is_scheduled: boolean;
  is_diagnostic: boolean;
  integration_id?: number | string;
  integration_data?: unknown;
  services?: {
    service_id: string;
    name: string;
    time: number;
    price: number;
    integration_id?: string;
    integration_id_data?: any;
  }[];
  products?: {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    integration_id?: string;
    integration_id_data?: any;
  }[];
}
