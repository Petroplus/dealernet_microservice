export interface UserResponse {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
  phone: string;
  secret_key: string;
  cod_consultor: string;
  app_version: string;
  role: string;
  fcm_hash: string;
  clients: UserClientResponse[];
}

export interface UserClientResponse {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
  document: string;
  status: string;
  nbs_cod: string;
  url: string;
  token: string;
  state_registration: string;
  municipal_registration: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  fax: string;
  brand_url: string;
  dealership_url: string;
  notification_order_flow_id: string;
  deleted_at: string;
  pool_id: string;
  company_id: string;
  pool: UserClientPoolResponse;
  company: UserClientCompanyResponse;
  config_client: UserClientConfigClientResponse;
  config_consultant: UserClientConfigConsultantResponse;
  config_email: UserClientConfigEmailResponse;
  config_integration: UserClientConfigIntegrationResponse;
  config_mechanic: UserClientConfigMechanicResponse;
  config_menu: UserClientConfigMenuResponse;
}

export interface UserClientPoolResponse {
  created_at: string;
  updated_at: string;
  id: string;
  name: string;
}

export interface UserClientCompanyResponse {
  created_at: string;
  updated_at: string;
  id: string;
  pool_id: string;
  name: string;
}

export interface UserClientConfigClientResponse {
  id: string;
  client_id: string;
  type: string;
  DMS: string;
  price_visible: boolean;
  os_customer_signature: boolean;
  pdf_consultant_url: string;
  pdf_mechanic_url: string;
}

export interface UserClientConfigConsultantResponse {
  id: string;
  client_id: string;
  consultant_flow_enabled: boolean;
  create_schedule_enabled: boolean;
  add_passerby_enabled: boolean;
  search_customer_enabled: boolean;
  register_customer_enabled: boolean;
  pdf_enabled: boolean;
  package_without_mech_enabled: boolean;
  discount_enabled: boolean;
  pdf_type: number;
}

export interface UserClientConfigEmailResponse {
  id: string;
  client_id: string;
  send: boolean;
  email_type: string;
}

export interface UserClientConfigIntegrationResponse {
  id: string;
  client_id: string;
  scheduling_enabled: boolean;
  os_enabled: boolean;
  pre_os_enabled: boolean;
  complementary_budget_enabled: boolean;
  add_remove_products_enabled: boolean;
  dms_packages_enabled: boolean;
}

export interface UserClientConfigMechanicResponse {
  id: string;
  client_id: string;
  mech_flow_enabled: boolean;
  pdf_mech_enabled: boolean;
  pdf_quality_enabled: boolean;
}

export interface UserClientConfigMenuResponse {
  id: string;
  client_id: string;
  review_packages_enabled: boolean;
  audit_enabled: boolean;
  romaneio_enabled: boolean;
  nps_enabled: boolean;
  os_enabled: boolean;
  budget_enabled: boolean;
  completed_process_enabled: boolean;
}
