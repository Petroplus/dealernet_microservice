import { ApiProperty } from '@nestjs/swagger';

export class EmailEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  customer_id: string;

  constructor(partial: Partial<EmailEntity>) {
    Object.assign(this, partial);
  }
}
