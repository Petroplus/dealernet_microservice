export enum OrderItemSourceGroupEnum {
  'bundled_services' = 'bundled_services',
  'services_recommended' = 'services_recommended',
  'services_review' = 'services_review',
  'additional_services' = 'additional_services',
  'additional_budget' = 'additional_budget',
  'customer_request_services' = 'customer_request_services',
}

export type OrderItemSourceGroup = keyof typeof OrderItemSourceGroupEnum;
