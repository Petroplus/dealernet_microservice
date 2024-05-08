import { ApiProperty } from '@nestjs/swagger';

export class ProdutoItemResponse {
  @ApiProperty()
  KitTMOProduto_ProdutoCod: number;

  @ApiProperty()
  KitTMOProduto_ProdutoDes: string;

  @ApiProperty()
  KitTMOProduto_ProdutoRef: string;

  @ApiProperty()
  KitTMOProduto_Quantidade: number;

  @ApiProperty()
  KitTMOProduto_Valor: number;
}

export class ServicoItemResponse {
  @ApiProperty()
  KitTMO_TMOCod: number;

  @ApiProperty()
  KitTMO_TMODes: string;

  @ApiProperty()
  KitTMO_TMOReferencia: string;

  @ApiProperty()
  KitTMO_Tempo: number;

  @ApiProperty()
  KitTMO_Cobrar: boolean;

  @ApiProperty()
  KitTMO_PrecoFechado: boolean;

  @ApiProperty()
  KitTMO_Valor: number;

  @ApiProperty()
  Mensagem: string;

  @ApiProperty({ type: [ProdutoItemResponse] })
  Produto: ProdutoItemResponse[];
}

export class ServicoResponse {
  @ApiProperty({ type: ServicoItemResponse })
  ServicoItem: ServicoItemResponse;
}

export class KitResponse {
  @ApiProperty()
  Kit_Codigo: number;

  @ApiProperty()
  Kit_Descricao: string;

  @ApiProperty()
  Kit_Valor: number;

  @ApiProperty()
  GrupoKit_Codigo: number;

  @ApiProperty()
  GrupoKit_Descricao: string;

  @ApiProperty()
  Kit_Promocao: boolean;

  @ApiProperty()
  Kit_TipoVenda: string;

  @ApiProperty()
  Kit_MotorizacaoCod: number;

  @ApiProperty()
  Kit_MotorizacaoDesc: string;

  @ApiProperty()
  Kit_MarcaDesc: string;

  @ApiProperty()
  Kit_Seleciona: boolean;

  @ApiProperty()
  Mensagem: string;

  @ApiProperty({ type: ServicoResponse })
  Servico: ServicoResponse;
}
