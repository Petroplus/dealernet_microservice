import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ServiceFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  reference?: string;
}
