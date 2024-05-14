import { ApiProperty } from '@nestjs/swagger';

export class WebhookEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  callbak: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  field: string;

  @ApiProperty()
  older_value: string[];

  @ApiProperty()
  new_value: string[];
}
