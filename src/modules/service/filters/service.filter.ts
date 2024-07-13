import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { IsArray } from 'src/commons/validations/is-array.validation';

export class ServiceFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  service_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray('string')
  service_ids?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  os_type_acronym?: string;
}
