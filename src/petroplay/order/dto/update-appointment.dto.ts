import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { AppointmentStatus, AppointmentStatusEnum } from '../entity/order-appointment.entity';

export class UpdateAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  service_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  is_additional?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  is_recommended?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  mechanic_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @ApiProperty({ required: false, enum: AppointmentStatusEnum })
  @IsOptional()
  @IsEnum(AppointmentStatusEnum)
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  reason_stopped_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  was_sent_to_dms?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  integration_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  integration_data?: JSON;
}
