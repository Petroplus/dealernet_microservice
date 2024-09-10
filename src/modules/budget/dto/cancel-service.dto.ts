import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CancelServiceDTO {
  @ApiProperty()
  @IsNotEmpty()
  budget_service_id: string;

  @ApiProperty()
  @IsOptional()
  reason_for_cancel: string;
}
