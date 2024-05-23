export enum OrderRelationsEnum {
  'client' = 'client',
  'items' = 'items',
  'items.service' = 'items.service',
  'items.service.items' = 'items.service.items',
  'items.service.items.task' = 'items.service.items.task',
  'items.service.items.product' = 'items.service.items.product',
  'items.products' = 'items.products',
  'tuneups' = 'tuneups',
  'vehicle_maker' = 'vehicle_maker',
  'vehicle_model' = 'vehicle_model',
  'vehicle_version' = 'vehicle_version',
  'consultant' = 'consultant',
  'sector' = 'sector',
  'os_type' = 'os_type',
  'customer_requests' = 'customer_requests',
  'surveys_answers' = 'surveys_answers',
  'additional_products' = 'additional_products',
  'additional_services' = 'additional_services',
  'budgets' = 'budgets',
  'appointments' = 'appointments',
  'current_employee' = 'current_employee',
  'medias' = 'medias',
}

export type OrderRelations = keyof typeof OrderRelationsEnum;