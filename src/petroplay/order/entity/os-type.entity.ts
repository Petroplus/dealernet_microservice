import { ApiProperty } from '@nestjs/swagger';

export enum ClientOsTypeStatusEnum {
  ACTV = 'ACTV', // Active
  INCT = 'INCT', // Inactive
}

export type ClientOsTypeStatus = keyof typeof ClientOsTypeStatusEnum;

export class ClientOsTypeEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  client_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  external_id: string;

  @ApiProperty({ enum: ClientOsTypeStatusEnum })
  status: ClientOsTypeStatus;

  constructor(partial?: Partial<ClientOsTypeEntity>) {

    Object.assign(this, partial);
  }
}
