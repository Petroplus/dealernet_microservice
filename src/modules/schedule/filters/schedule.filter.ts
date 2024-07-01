import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

import { IsArray } from 'src/commons/validations/is-array.validation';

export class ScheduleFilter {
  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @IsArray('uuid')
  client_ids?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  schedule_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: Date;
}
