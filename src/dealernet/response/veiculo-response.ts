import { ApiProperty } from '@nestjs/swagger';

export interface VeiculoInfo {
  Veiculo: number;
  VeiculoPlaca: string;
  VeiculoChassi: string;
  VeiculoAno_Codigo: number;
  VeiculoModelo_Codigo: number;
  VeiculoModelo_Descricao: string;
  VeiculoFamilia_Descricao: string;
  VeiculoMarca_Codigo: number;
  VeiculoMarca_Descricao: string;
  Veiculo_CorExterna: number;
  Veiculo_CorExternaDescricao: string;
  Veiculo_CorExternaTipo: string;
  Veiculo_CorExternaRenavam: string;
  Veiculo_CorInterna: number;
  Veiculo_CorInternaDescricao: string;
  Veiculo_Km: number;
  Veiculo_DataAtualizacaoKm: string;
  Veiculo_KmMedio: number;
  Veiculo_NumeroRenavam: number;
  Veiculo_Combustivel: string;
  Veiculo_Transmissao: string;
  Veiculo_Tipo: string;
  Veiculo_DataVenda: string;
  Veiculo_DataEntrega: string;
  Veiculo_DataExpiracaoGarantia: string;
  Veiculo_NumeroMotor: string;
  Cliente: number;
  ClienteDocumento: number;
  ClienteNome: string;
  VendedorNome: string;
  Mensagem: string;
}

export class VeiculoApiResponse {
  @ApiProperty()
  Veiculo: number;

  @ApiProperty()
  VeiculoPlaca: string;

  @ApiProperty()
  VeiculoChassi: string;

  @ApiProperty()
  VeiculoAno_Codigo: number;

  @ApiProperty()
  VeiculoModelo_Codigo: number;

  @ApiProperty()
  VeiculoModelo_Descricao: string;

  @ApiProperty()
  VeiculoFamilia_Descricao: string;

  @ApiProperty()
  VeiculoMarca_Codigo: number;

  @ApiProperty()
  VeiculoMarca_Descricao: string;

  @ApiProperty()
  Veiculo_CorExterna: number;

  @ApiProperty()
  Veiculo_CorExternaDescricao: string;

  @ApiProperty()
  Veiculo_CorExternaTipo: string;

  @ApiProperty()
  Veiculo_CorExternaRenavam: string;

  @ApiProperty()
  Veiculo_CorInterna: number;

  @ApiProperty()
  Veiculo_CorInternaDescricao: string;

  @ApiProperty()
  Veiculo_Km: number;

  @ApiProperty()
  Veiculo_DataAtualizacaoKm: string;

  @ApiProperty()
  Veiculo_KmMedio: number;

  @ApiProperty()
  Veiculo_NumeroRenavam: number;

  @ApiProperty()
  Veiculo_Combustivel: string;

  @ApiProperty()
  Veiculo_Transmissao: string;

  @ApiProperty()
  Veiculo_Tipo: string;

  @ApiProperty()
  Veiculo_DataVenda: string;

  @ApiProperty()
  Veiculo_DataEntrega: string;

  @ApiProperty()
  Veiculo_DataExpiracaoGarantia: string;

  @ApiProperty()
  Veiculo_NumeroMotor: string;

  @ApiProperty()
  Cliente: number;

  @ApiProperty()
  ClienteDocumento: number;

  @ApiProperty()
  ClienteNome: string;

  @ApiProperty()
  VendedorNome: string;

  @ApiProperty()
  Mensagem: string;
}
