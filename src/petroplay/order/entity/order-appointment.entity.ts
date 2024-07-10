import { ApiProperty } from '@nestjs/swagger';

import { AppointmentReasonStoppedOptionEntity } from './appointment-reason-stopped-option.entity';
import { UserEntity } from './user.entity';
export enum AppointmentStatusEnum {
  STOPPED = 'STOPPED',
  CANCELED = 'CANCELED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export type AppointmentStatus = keyof typeof AppointmentStatusEnum;

export class OrderAppointmentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  order_budget_id: string;

  @ApiProperty()
  service_id: string;

  @ApiProperty()
  service_name: string;

  @ApiProperty()
  mechanic_id: string;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  is_additional: boolean;

  @ApiProperty()
  is_recommended: boolean;

  @ApiProperty({ enum: AppointmentStatusEnum })
  status: AppointmentStatus;

  @ApiProperty()
  integration_id: string;

  @ApiProperty()
  integration_data: JSON;

  @ApiProperty()
  was_sent_to_dms: boolean;

  @ApiProperty({ type: () => AppointmentReasonStoppedOptionEntity })
  reason_stopped: AppointmentReasonStoppedOptionEntity;

  @ApiProperty({ type: () => UserEntity })
  mechanic: UserEntity;

  constructor(partial?: Partial<OrderAppointmentEntity>) {
    Object.assign(this, partial);
  }
}
