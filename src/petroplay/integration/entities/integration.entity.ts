export interface IntegrationResponse {
  client_id: string;
  dms: 'DEALERNET';
  use_mapsis: boolean;
  dealernet: IntegrationDealernet;
  mapsis: IntegrationMapSisEntity;
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
