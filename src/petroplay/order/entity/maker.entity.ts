import { ApiProperty } from '@nestjs/swagger';

import { ModelEntity } from './model.entity';

export class MakerEntity {
  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  table_id: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  models: ModelEntity[];
}
