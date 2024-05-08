export interface IntegrationEntity {
  client_id: string;
  dms: 'PPS' | 'SEM INTEGRAÇÃO' | 'LINX' | 'MR SISTEMAS' | 'NBS' | 'DEALERNET';
  use_mapsis: boolean;
  nbs: IntegrationNbsEntity;
  linx: IntegrationLinxEntity;
  mapsis: IntegrationMapSisEntity;
}

interface IntegrationNbsEntity {
  id: string;
  client_id: string;
  url: string;
  cod_empresa: number;
  os_type: string;
  cod_setor_venda: number;
  cod_fornecedor: number;
  cod_consultor: string;
  services: string[];
  usuario: string;
  senha: string;
  nbsToken: string;
  vehicles: IntegrationNbsVehicleEntity[];
}

interface IntegrationNbsVehicleEntity {
  id: string;
  client_id: string;
  cod_modelo: string;
  cod_produto: string;
  maker_id: number;
  model_id: number;
  version_id: number;
  year: number;
  fuel: string;
  maker: IntegrationNbsVehicleMakerEntity;
  model: IntegrationNbsVehicleModelEntity;
  version: IntegrationNbsVehicleVersionEntity;
}

interface IntegrationNbsVehicleMakerEntity {
  id: number;
  name: string;
}

interface IntegrationNbsVehicleModelEntity {
  maker_id: number;
  id: number;
  name: string;
}

interface IntegrationNbsVehicleVersionEntity {
  id: number;
  name: string;
  model_id: number;
  years: string[];
  table_id: number;
  image: any;
}

interface IntegrationLinxEntity {
  created_at: string;
  updated_at: string;
  id: string;
  client_id: string;
  base64: string;
  secret: string;
  cnpj: string;
  url: string;
  access: IntegrationLinxAccessEntity;
  vehicles: IntegrationLinxVehicleEntity[];
}

interface IntegrationLinxAccessEntity {
  CodigoFilial: string;
  Empresa: number;
  Revenda: number;
  Bandeira: string;
  CodigoUsuario: number;
  CodigoConsultor: string;
}

interface IntegrationLinxVehicleEntity {
  created_at: string;
  updated_at: string;
  linx_maker: string;
  linx_model: string;
  maker_id: number;
  model_id: number;
  maker: IntegrationLinxVehicleMakerEntity;
  model: IntegrationLinxVehicleModelEntity;
}

interface IntegrationLinxVehicleMakerEntity {
  id: number;
  name: string;
}

interface IntegrationLinxVehicleModelEntity {
  maker_id: number;
  id: number;
  name: string;
}

interface IntegrationMapSisEntity {
  client_id: string;
  url: string;
  cod_loja: string;
  usuario: string;
  senha: string;
  chave: string;
  encode: boolean;
}
