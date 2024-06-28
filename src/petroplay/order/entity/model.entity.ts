import { ApiProperty } from '@nestjs/swagger';

import { VersionEntity } from './version.entity';

export class ModelEntity {
  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  maker_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  front: string;

  @ApiProperty()
  back: string;

  @ApiProperty()
  versions: VersionEntity[];
}
