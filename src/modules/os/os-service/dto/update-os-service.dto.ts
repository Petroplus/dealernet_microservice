import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

import { StatusExecucao, StatusExecucaoEnum } from '../enum/status-execucao.enum';

export class UpdateOsServiceProductDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  TipoOSSigla?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ProdutoReferencia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ValorUnitario?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  Quantidade?: number;

  @ApiProperty({ required: false, enum: StatusExecucaoEnum })
  @IsOptional()
  @IsEnum(StatusExecucaoEnum)
  StatusExecucao?: StatusExecucao;

  @ApiProperty({ required: false })
  @IsOptional()
  VendedorRequisicaoDocumento?: string;
}

export class UpdateOsServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  TipoOSSigla?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  TMOReferencia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  Tempo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ValorUnitario?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  Quantidade?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  ProdutivoDocumento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  UsuarioIndResponsavel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  Cobrar?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  Executar?: boolean;

  @ApiProperty({ required: false, enum: StatusExecucaoEnum })
  @IsOptional()
  @IsEnum(StatusExecucaoEnum)
  StatusExecucao?: StatusExecucao;

  @ApiProperty({ required: false })
  @IsOptional()
  Observacao?: string;

  @ApiProperty({ required: false, type: UpdateOsServiceProductDto, isArray: true })
  @IsOptional()
  @Type(() => UpdateOsServiceProductDto)
  @ValidateNested({ each: true })
  Produtos?: UpdateOsServiceProductDto[];
}
