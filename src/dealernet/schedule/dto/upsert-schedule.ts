import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { IsRegExp } from 'src/commons/validations/is-regexp';

export class UpsertScheduleProductDto {
  @ApiProperty()
  @ApiProperty({ required: false })
  @IsOptional()
  Chave?: string;

  @ApiProperty()
  @IsNotEmpty()
  ProdutoReferencia: string;

  @ApiProperty()
  @IsNotEmpty()
  TipoOSSigla: string;

  @ApiProperty()
  @IsNotEmpty()
  Quantidade: number;

  @ApiProperty()
  @IsNotEmpty()
  ValorUnitario: number;
}

export class UpsertScheduleServiceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  Chave?: string;

  @ApiProperty()
  @IsNotEmpty()
  TMOReferencia: string;

  @ApiProperty()
  @IsNotEmpty()
  TipoOSSigla: string;

  @ApiProperty()
  @IsNotEmpty()
  Tempo: number;

  @ApiProperty()
  @IsNotEmpty()
  ValorUnitario: number;

  @ApiProperty()
  @IsNotEmpty()
  Quantidade: number;

  @ApiProperty({ required: false, type: [UpsertScheduleProductDto] })
  @IsOptional()
  @Type(() => UpsertScheduleProductDto)
  @ValidateNested({ each: true })
  Produtos?: UpsertScheduleProductDto[];
}

export class UpsertScheduleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  Chave?: string;

  @ApiProperty()
  @IsNotEmpty()
  VeiculoChassi: string;

  @ApiProperty()
  @IsNotEmpty()
  VeiculoPlaca?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString().replace(/\D/g, ''))
  VeiculoKM: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsRegExp(/^[0-9]{4}$/)
  VeiculoAno?: string;

  @ApiProperty()
  @IsNotEmpty()
  VeiculoColor: string;

  @ApiProperty()
  @IsNotEmpty()
  ClienteNome: string;

  @ApiProperty()
  @IsNotEmpty()
  ClienteDocumento: string;

  @ApiProperty()
  @IsOptional()
  Data: string;

  @ApiProperty()
  @IsNotEmpty()
  DataInicial: string;

  @ApiProperty({ required: false })
  @IsOptional()
  DataFinal?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ConsultorDocumento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  TipoOSSigla?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  Observacao?: string;

  @ApiProperty({ required: false, type: [UpsertScheduleServiceDto] })
  @IsOptional()
  @Type(() => UpsertScheduleServiceDto)
  @ValidateNested({ each: true })
  Servicos?: UpsertScheduleServiceDto[];
}
