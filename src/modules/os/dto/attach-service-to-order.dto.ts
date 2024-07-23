import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AttachServiceToOrderDTO {
  @ApiProperty()
  @IsNotEmpty()
  service_id: string;

  @ApiProperty()
  @IsNotEmpty()
  os_type_id: string;
}
