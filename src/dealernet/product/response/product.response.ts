import { ApiProperty } from '@nestjs/swagger';

export class ProdutoDealernetResponse {
  @ApiProperty()
  ProdutoCodigo: number;

  @ApiProperty()
  ProdutoReferencia: string;

  @ApiProperty()
  ProdutoDescricao: string;

  @ApiProperty()
  QuantidadeDisponivel: number;

  @ApiProperty()
  UnidadeMedidaCodigo: number;

  @ApiProperty()
  UnidadeMedidaDescricao: string;

  @ApiProperty()
  PrecoPublico: number;

  @ApiProperty()
  PrecoSugerido: number;

  @ApiProperty()
  PrecoGarantia: number;

  @ApiProperty()
  PrecoReposicao: number;

  @ApiProperty()
  Mensagem: string;
}
