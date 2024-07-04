import { ApiProperty } from '@nestjs/swagger';
export enum ReasonStoppedOptionEnum {
  temporary = 'temporary',
  finished = 'finished',
}

export type ReasonStoppedOptionType = keyof typeof ReasonStoppedOptionEnum;

export class AppointmentReasonStoppedOptionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  client_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ReasonStoppedOptionEnum })
  type: ReasonStoppedOptionType;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  external_id: string;


  constructor(partial: Partial<AppointmentReasonStoppedOptionEntity>) {
    Object.assign(this, partial);
  }
}
