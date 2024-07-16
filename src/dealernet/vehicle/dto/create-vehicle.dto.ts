import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDealernetVehicleDTO {
  @ApiProperty({ type: String, description: 'Código do veículo' })
  @IsOptional()
  Veiculo_Codigo?: string;

  @ApiProperty({ type: String, description: 'Placa do veículo' })
  @IsNotEmpty()
  Veiculo_Placa: string;

  @ApiProperty({ type: String, description: 'Número do Chassi' })
  Veiculo_Chassi: string;

  @ApiProperty({ type: Number, description: 'Codigo do ano do veiculo' })
  @IsOptional()
  Veiculo_AnoCodigo?: number;

  @ApiProperty({ type: String, description: 'Cor externa do veiculo' })
  @IsOptional()
  Veiculo_CorExterna?: string;

  @ApiProperty({ type: String, description: 'Modelo do veiculo' })
  @IsOptional()
  Veiculo_CorInterna?: string;

  @ApiProperty({ type: String, description: 'Codigo do modelo do veiculo' })
  @IsOptional()
  Veiculo_Modelo?: string;

  @ApiProperty({ type: Number, description: 'Km rodados pelo veículo' })
  @IsNotEmpty()
  Veiculo_Km: number | string;

  @ApiProperty({ type: String, description: 'Data da venda do veiculo' })
  @IsOptional()
  Veiculo_DataVenda?: string;

  @ApiProperty({ type: String, description: 'Numero do motor do veiculo' })
  @IsOptional()
  Veiculo_NumeroMotor?: string;

  @ApiProperty({ type: String, description: 'Documento do dono do veiculo' })
  @IsNotEmpty()
  Cliente_Documento: string;
}
