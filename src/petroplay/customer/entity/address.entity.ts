import { ApiProperty } from '@nestjs/swagger';

export class AddressEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  address_name: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  complement: string;

  @ApiProperty()
  neighborhood: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  postal_code: string;

  @ApiProperty()
  is_default: boolean;

  @ApiProperty()
  customer_id: string;

  constructor(partial: Partial<AddressEntity>) {
    Object.assign(this, partial);
  }
}
