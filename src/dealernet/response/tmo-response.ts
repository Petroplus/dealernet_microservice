import { ApiProperty } from '@nestjs/swagger';

export class TMO {
  @ApiProperty()
  TMO_Codigo: number;

  @ApiProperty()
  TMO_Referencia: string;

  @ApiProperty()
  TMO_Descricao: string;

  @ApiProperty()
  TMO_Tipo: string;

  @ApiProperty()
  TipoOS_Codigo: number;

  @ApiProperty()
  Tempo: number;

  @ApiProperty()
  Valor: number;

  @ApiProperty()
  TMOTempo_Ativo: boolean;

  @ApiProperty()
  Cobrar: boolean;

  @ApiProperty()
  Mensagem: string;
}
