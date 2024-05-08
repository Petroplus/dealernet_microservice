import { ApiProperty } from '@nestjs/swagger';

export interface Agendamento {
  Chave: string;
  EmpresaDocumento: string;
  VeiculoPlaca: string;
  VeiculoChassi: string;
  VeiculoKM: string;
  VeiculoModelo: string;
  VeiculoAnoCodigo: string;
  ClienteDocumento: string;
  ClienteNome: string;
  ConsultorDocumento: string;
  ConsultorNome: string;
  Data: string;
  Observacao: string;
  Status: string;
  Mensagem: string;
}

export interface AgendamentoResponse {
  Sdt_fsagendamentooutlista: {
    SDT_FSAgendamentoOut: Agendamento;
  };
}

export class AgendamentoDTOResponse {
  @ApiProperty()
  Chave: string;

  @ApiProperty()
  EmpresaDocumento: string;

  @ApiProperty()
  VeiculoPlaca: string;

  @ApiProperty()
  VeiculoChassi: string;

  @ApiProperty()
  VeiculoKM: string;

  @ApiProperty()
  VeiculoModelo: string;

  @ApiProperty()
  VeiculoAnoCodigo: string;

  @ApiProperty()
  ClienteDocumento: string;

  @ApiProperty()
  ClienteNome: string;

  @ApiProperty()
  ConsultorDocumento: string;

  @ApiProperty()
  ConsultorNome: string;

  @ApiProperty()
  Data: string;

  @ApiProperty()
  Observacao: string;

  @ApiProperty()
  Status: string;

  @ApiProperty()
  Mensagem: string;
}
