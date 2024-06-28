import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VehicleFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  license_plate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  chassis_number?: string;
}
