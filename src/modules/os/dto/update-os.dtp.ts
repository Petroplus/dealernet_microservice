import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

import { IsDateString } from 'src/commons/validations/is-date.validation';

export class UpdateOsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  VeiculoKM: number;

  @ApiProperty({ required: false })
  @IsOptional()
  ConsultorDocumento: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  DataFinal: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  Status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  Observacao: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  DataPrometida: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  ObservacaoConsultor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  TipoOSSigla?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ExisteObjetoValor?: boolean;
}
