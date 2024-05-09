import { ApiProperty } from '@nestjs/swagger';

export interface DealernetSchedule {
  Chave: string;
  EmpresaDocumento: string;
  VeiculoPlaca: string;
  VeiculoChassi: string;
  VeiculoKM: string;
  VeiculoModelo: string;
  VeiculoAnoCodigo: string;
  ClienteCodigo: number;
  ClienteDocumento: string;
  ClienteNome: string;
  ConsultorDocumento: string;
  ConsultorNome: string;
  Data: string;
  Observacao: string;
  Status: string;
  Mensagem: string;
}

export interface DealernetScheduleResponse {
  Sdt_fsagendamentooutlista: {
    SDT_FSAgendamentoOut: DealernetSchedule;
  };
}

export class DealernetScheduleDTOResponse {
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
