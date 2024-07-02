import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class OrderFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  integration_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dataInicio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dataFim?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  veiculoPlacaChassi?: string;
}
