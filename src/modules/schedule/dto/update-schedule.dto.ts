import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { CreateScheduleDto } from './create-schedule';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty()
  @IsNotEmpty()
  integration_id: number;
}
