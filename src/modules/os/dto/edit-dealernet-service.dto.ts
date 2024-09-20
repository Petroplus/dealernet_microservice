import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class EditDealernetServiceDTO {
  @ApiProperty()
  @IsNotEmpty()
  service_id: string;

  @ApiProperty()
  @IsOptional()
  status: string;
}
