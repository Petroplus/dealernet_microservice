import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ServiceFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  item_ref?: string;
}
