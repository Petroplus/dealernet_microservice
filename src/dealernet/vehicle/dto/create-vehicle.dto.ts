import { ApiProperty } from '@nestjs/swagger';

export class CreateDealenertVehicleDTO {
  @ApiProperty({ type: String, description: 'Placa do veículo' })
  Veiculo_Placa: string;

  @ApiProperty({ type: String, description: 'Número do Chassi' })
  Veiculo_Chassi: string;

  @ApiProperty({ type: Number, description: 'Codigo do ano do veiculo' })
  Veiculo_AnoCodigo: number;

  @ApiProperty({ type: String, description: 'Codigo do modelo do veiculo' })
  Veiculo_Modelo: string;

  @ApiProperty({ type: Number, description: 'Cor externa do veiculo' })
  Veiculo_CorExterna: number;

  @ApiProperty({ type: Number, description: 'Km rodados pelo veículo' })
  Veiculo_Km: number;

  @ApiProperty({ type: String, description: 'Data da venda do veiculo' })
  Veiculo_DataVenda: string;

  @ApiProperty({ type: String, description: 'Numero do motor do veiculo' })
  Veiculo_NumeroMotor: string;

  @ApiProperty({ type: String, description: 'Documento do dono do veiculo' })
  Cliente_Documento: string;
}
