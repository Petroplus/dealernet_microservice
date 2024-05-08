import { ApiProperty } from '@nestjs/swagger';

export class FindDealernetSchedulesDto {
  @ApiProperty()
  apiUrl: string;

  @ApiProperty()
  user: string;

  @ApiProperty()
  password: string;
}
