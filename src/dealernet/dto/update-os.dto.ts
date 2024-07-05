import { ApiProperty } from '@nestjs/swagger';


export class MarcacaoUpdateDto {
    @ApiProperty()
    usuario_documento_produtivo: string;

    @ApiProperty()
    data_inicial:string;

    @ApiProperty()
    data_final:string;

    @ApiProperty()
    motivo_parada:string;

    @ApiProperty()
    observacao:string;

}

export class ProdutoUpdateDto {
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

export class ServicoUpdateDto {
  @ApiProperty()
  chave: string;
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
  produtivo_documento?:string;

  @ApiProperty()
  usuario_ind_responsavel?: string;

  @ApiProperty({ type: ProdutoUpdateDto })
  produtos: ProdutoUpdateDto[];

  @ApiProperty({ type: MarcacaoUpdateDto })
  marcacoes?: MarcacaoUpdateDto[];
}

export class TipoOSItemUpdateDto {
  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  consultor_documento: any;

  @ApiProperty()
  condicao_pagamento?: number;
}

export class TipoOSUpdateDto {
  @ApiProperty({ type: TipoOSItemUpdateDto })
  tipo_os_item: TipoOSItemUpdateDto;
}

export class UpdateOsDTO {
  @ApiProperty()
  chave: string;

  // @ApiProperty()
  // numero_os:string;

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

  @ApiProperty({ type: ServicoUpdateDto })
  servicos: ServicoUpdateDto[];

  @ApiProperty({ type: TipoOSUpdateDto })
  tipo_os: TipoOSUpdateDto;
}
