import { ApiProperty } from '@nestjs/swagger';

import { AddressEntity } from './address.entity';
import { EmailEntity } from './email.entity';
import { PhoneEntity } from './phone.entity';

export class PetroplayCustomerEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  document: string;

  @ApiProperty()
  client_id: string;

  @ApiProperty()
  external_id: string;

  @ApiProperty({ type: PhoneEntity, isArray: true })
  phones?: PhoneEntity[];

  @ApiProperty({ type: EmailEntity, isArray: true })
  emails?: EmailEntity[];

  @ApiProperty({ type: AddressEntity, isArray: true })
  addresses?: AddressEntity[];

  constructor(partial?: Partial<PetroplayCustomerEntity>) {
    Object.assign(this, partial);
  }
}
