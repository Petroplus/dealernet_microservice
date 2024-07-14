import { ApiProperty } from '@nestjs/swagger';

export class ProdutoCreateDTO {
  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  produto?: string;

  @ApiProperty()
  produto_referencia?: string;

  @ApiProperty()
  valor_unitario: number;

  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  desconto?: number;

  @ApiProperty()
  desconto_percentual?: number;

  @ApiProperty()
  kit_codigo?: number;

  @ApiProperty()
  campanha_codigo?: number;

  @ApiProperty()
  selecionado?: boolean;
}

export class ServicoCreateDTO {
  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  tmo_referencia: string;

  @ApiProperty()
  tempo: number;

  @ApiProperty()
  valor_unitario: number;

  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  produtivo_documento?: string | number;

  @ApiProperty()
  usuario_ind_responsavel?: string | number;

  @ApiProperty()
  cobra?: boolean;

  @ApiProperty({ type: ProdutoCreateDTO })
  produtos: ProdutoCreateDTO[];
}

export class TipoOSItemCreateDTO {
  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  consultor_documento: any;

  @ApiProperty()
  condicao_pagamento?: number;
}

export class TipoOSCreateDTO {
  @ApiProperty({ type: TipoOSItemCreateDTO })
  tipo_os_item: TipoOSItemCreateDTO;
}

export class CreateOsDTO {
  @ApiProperty()
  veiculo_placa_chassi: string;

  @ApiProperty()
  veiculo_Km: number;

  @ApiProperty()
  cliente_documento: string;

  @ApiProperty()
  consultor_documento: string;

  @ApiProperty()
  data: string;

  @ApiProperty()
  data_final?: string;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  observacao: string;

  @ApiProperty()
  data_prometida?: string;

  @ApiProperty()
  dias_prazo_entrega?: number;

  @ApiProperty()
  percentual_combustivel?: number;

  @ApiProperty()
  percentual_bateria?: number;

  @ApiProperty()
  exige_lavagem?: boolean;

  @ApiProperty()
  cliente_aguardando?: boolean;

  @ApiProperty()
  inspecionado_elevador?: boolean;

  @ApiProperty()
  bloquear_produto?: boolean;

  @ApiProperty()
  prisma_codigo?: string;

  @ApiProperty()
  nro_prisma?: string;

  @ApiProperty()
  os_entrega_domicilio?: string;

  @ApiProperty()
  observacao_consultor?: string;

  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  existe_objeto_valor?: boolean;

  @ApiProperty()
  carregar_bateria?: string;

  @ApiProperty({ type: ServicoCreateDTO })
  servicos: ServicoCreateDTO[];

  @ApiProperty({ type: TipoOSCreateDTO })
  tipo_os?: TipoOSCreateDTO;

  @ApiProperty()
  tipo_os_array?: string[];

  @ApiProperty()
  tipo_os_types?: TipoOSItemCreateDTO[];
}
