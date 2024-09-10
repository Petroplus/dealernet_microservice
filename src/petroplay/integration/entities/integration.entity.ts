export interface IntegrationResponse {
  client_id: string;
  dms: 'DEALERNET';
  use_mapsis: boolean;
  dealernet: IntegrationDealernet;
  mapsis: IntegrationMapSisEntity;
  config: IntegrationConfig;
}

export interface IntegrationMapSisEntity {
  client_id: string;
  url: string;
  cod_loja: string;
  usuario: string;
  senha: string;
  chave: string;
  encode: boolean;
}

export interface IntegrationDealernet {
  id?: string;
  client_id?: string;
  url: string;
  user: string;
  key: string;
  document?: string;
  mechanic_document?: string;
  consultant_document?: string;
  execution_sector?: string;
}

export interface IntegrationDealernetVehicle {
  client_id: string;
  veiculo_codigo: number;
  veiculo_descricao: string;
  maker_id: number;
  model_id: number;
  version_id: number;
  year: number;
  fuel: string;
}

export interface IntegrationConfig {
  scheduling_enabled: boolean;
  os_enabled: boolean;
  pre_os_enabled: boolean;
  complementary_budget_enabled: boolean;
  add_remove_products_enabled: boolean;
  dms_packages_enabled: boolean;
  round_product_quantity: boolean;
  import_customer_request_of_dms_enable: boolean;
  import_customer_request_services_of_dms_enable: boolean;
  edit_price_of_service_enable: boolean;
  edit_price_of_product_enable: boolean;
}
