import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ProductFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  product_id?: string;
}
