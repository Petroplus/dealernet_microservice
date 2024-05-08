import { ApiProperty } from '@nestjs/swagger';

export class NotaFiscalItem {
  @ApiProperty()
  Movimento: string;

  @ApiProperty()
  Natureza: string;

  @ApiProperty()
  CodigoNF: number;

  @ApiProperty()
  NumeroNF: number;

  @ApiProperty()
  SerieNF: string | number;

  @ApiProperty()
  DataEmissao: string;

  @ApiProperty()
  ValorServico: number;

  @ApiProperty()
  ValorProduto: number;

  @ApiProperty()
  ValorDesconto: number;

  @ApiProperty()
  StatusNF: string;

  @ApiProperty()
  Vendedor_Codigo: number;

  @ApiProperty()
  Vendedor_Nome: string;
}

export class NotaFiscal {
  @ApiProperty({ type: [NotaFiscalItem] })
  Item: NotaFiscalItem[];
}

export class NotaFiscalResponse {
  @ApiProperty()
  TipoOS: string;

  @ApiProperty()
  Classificacao: string;

  @ApiProperty()
  Consultor_Codigo: number;

  @ApiProperty()
  Consultor_Nome: string;

  @ApiProperty()
  Mensagem: string;

  @ApiProperty({ type: NotaFiscal })
  NotaFiscal: NotaFiscal;
}
