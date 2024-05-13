import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ScheduleFilter {
  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => value.split(','))
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
