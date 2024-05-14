export interface OrderItemEntity {
  created_at: string;
  updated_at: string;
  id: string;
  order_id: string;
  service_id: string;
  source_group: any;
  price: string;
  estimated_time: number;
  approval_id: any;
  products: OrderItemProduct[];
  service: OrderItemService;
}

export interface OrderItemProduct {
  quantity: number;
  order_item_id: string;
  product_id: string;
  product: Product;
}

export interface Product {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  quantity: string;
  internal_id: string;
  price: number;
  description: string;
  is_recommendation: boolean;
  client_id: string;
  is_service: any;
  deleted_at: any;
}

export interface OrderItemService {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  internal_id: string;
  client_id: string;
  status: string;
  is_recommendation: boolean;
  items: ServiceItem[];
}

export interface ServiceItem {
  created_at: string;
  updated_at: string;
  id: string;
  entity_name: string;
  entity_id: string;
  entity_type: string;
  quantity: number;
  service_id: string;
  task: Task;
  product: Product;
}

export interface Task {
  created_at: string;
  updated_at: string;
  id: string;
  internal_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  client_id: string;
  deleted_at: any;
}
