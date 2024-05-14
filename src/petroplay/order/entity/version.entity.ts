import { ApiProperty } from '@nestjs/swagger';

export class VersionEntity {
  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  model_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  years: string[];

  @ApiProperty()
  table_id: number;

  @ApiProperty()
  fuel: string;

  @ApiProperty()
  image: string;
}
