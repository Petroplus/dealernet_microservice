import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { UpsertScheduleDto } from 'src/dealernet/schedule/dto/upsert-schedule';

export class CreateScheduleDto extends OmitType(UpsertScheduleDto, ['Chave']) {
  @ApiProperty()
  @IsNotEmpty()
  maker_id: number;

  @ApiProperty()
  @IsNotEmpty()
  model_id: number;

  @ApiProperty()
  @IsNotEmpty()
  version_id: number;
}
