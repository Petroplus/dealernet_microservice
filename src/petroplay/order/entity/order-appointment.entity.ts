import { ApiProperty } from '@nestjs/swagger';
export enum AppointmentStatusEnum {
  STOPED = 'STOPED',
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

  constructor(partial?: Partial<OrderAppointmentEntity>) {
    Object.assign(this, partial);
  }
}
