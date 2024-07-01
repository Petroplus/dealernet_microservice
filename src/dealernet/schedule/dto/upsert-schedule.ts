import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { IsRegExp } from 'src/commons/validations/is-regexp';

export class UpsertScheduleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  Chave?: string;

  @ApiProperty()
  @IsOptional()
  VeiculoChassi?: string;

  @ApiProperty()
  @IsNotEmpty()
  VeiculoPlaca?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString().replace(/\D/g, ''))
  VeiculoKM?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsRegExp(/^[0-9]{4}$/)
  VeiculoAno?: string;

  @ApiProperty()
  @IsNotEmpty()
  VeiculoColor?: string;

  @ApiProperty()
  @IsNotEmpty()
  ClienteNome: string;

  @ApiProperty()
  @IsNotEmpty()
  ClienteDocumento: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ConsultorDocumento: string;

  @ApiProperty({ required: false })
  @IsOptional()
  TipoOSSigla?: string;

  @ApiProperty()
  @IsNotEmpty()
  Data: string;

  @ApiProperty({ required: false })
  @IsOptional()
  DataFinal?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  Observacao?: string;
}
