import { ApiProperty } from '@nestjs/swagger';

export class PhoneEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  phone_type: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  contact_name: string;

  @ApiProperty()
  customer_id: string;

  constructor(partial: Partial<PhoneEntity>) {
    Object.assign(this, partial);
  }
}
