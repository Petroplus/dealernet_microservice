import { ApiProperty } from '@nestjs/swagger';
export enum UserStatusEnum {
  ACTV = 'ACTV',
  INTV = 'INTV',
  SUSP = 'SUSP',
}
export enum Role {
  SYSA = 'SYSA', // System Administrator
  ADMN = 'ADMN', // Administrator
  DRCT = 'DRCT', // Director
  MNGR = 'MNGR', // Manager
  CONS = 'CONS', // Consultant
  MECH = 'MECH', // Mechanic
  QASS = 'QASS', // Quality Assurance
  CUST = 'CUST', // Customer
  STCK = 'STCK', // Stocker
  CTCH = 'CTCH', // COTECH
  AQPV = 'AQPV', // AQPV
}

export type UserStatus = keyof typeof UserStatusEnum;

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty({ enum: UserStatusEnum, default: UserStatusEnum.ACTV })
  status: UserStatus;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  secret_key: string;

  @ApiProperty()
  cod_consultor: string;

  @ApiProperty()
  app_version: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  fcm_hash: string;


  constructor(partial?: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
