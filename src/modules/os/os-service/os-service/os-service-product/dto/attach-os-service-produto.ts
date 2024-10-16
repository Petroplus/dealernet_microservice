import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AttachOsServiceProdutoDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  os_type_id: string;
}
