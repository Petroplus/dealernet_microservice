import { ApiProperty } from '@nestjs/swagger';

export class DealernetBudgetProduto {
  @ApiProperty()
  Chave: number;

  @ApiProperty()
  TipoOS: number;

  @ApiProperty()
  TipoOSSigla: string;

  @ApiProperty()
  TMO: number;

  @ApiProperty()
  TMOReferencia: string;

  @ApiProperty()
  Descricao: string;

  @ApiProperty()
  Tempo: number;

  @ApiProperty()
  ValorUnitario: number;

  @ApiProperty()
  Quantidade: number;

  @ApiProperty()
  Desconto: number;

  @ApiProperty()
  DescontoPercentual: number;

  @ApiProperty()
  Observacao: string;

  @ApiProperty()
  Produtivo: number;

  @ApiProperty()
  ProdutivoDocumento: string;

  @ApiProperty()
  UsuarioIndResponsavel: string;

  @ApiProperty()
  Executar: boolean;

  @ApiProperty()
  Cobrar: boolean;

  @ApiProperty()
  DataPrevisao: string;

  @ApiProperty()
  StatusAutorizacao: string;

  @ApiProperty()
  StatusAndamento: string;

  @ApiProperty()
  StatusDesconto: string;

  @ApiProperty()
  KitCodigo: number;

  @ApiProperty()
  KitPrecoFechado: boolean;

  @ApiProperty()
  CampanhaCodigo: number;
}

export class DealernetBudgetServico {
  @ApiProperty()
  Chave: number;

  @ApiProperty()
  TipoOS: number;

  @ApiProperty()
  TipoOSSigla: string;

  @ApiProperty()
  TMO: number;

  @ApiProperty()
  TMOReferencia: string;

  @ApiProperty()
  Descricao: string;

  @ApiProperty()
  Tempo: number;

  @ApiProperty()
  ValorUnitario: number;

  @ApiProperty()
  Quantidade: number;

  @ApiProperty()
  Desconto: number;

  @ApiProperty()
  DescontoPercentual: number;

  @ApiProperty()
  Observacao: string;

  @ApiProperty()
  Produtivo: number;

  @ApiProperty()
  ProdutivoDocumento: string;

  @ApiProperty()
  UsuarioIndResponsavel: string;

  @ApiProperty()
  Executar: boolean;

  @ApiProperty()
  Cobrar: boolean;

  @ApiProperty()
  DataPrevisao: string;

  @ApiProperty()
  StatusAutorizacao: string;

  @ApiProperty()
  StatusAndamento: string;

  @ApiProperty()
  StatusDesconto: string;

  @ApiProperty()
  KitCodigo: number;

  @ApiProperty()
  KitPrecoFechado: boolean;

  @ApiProperty()
  CampanhaCodigo: number;

  @ApiProperty()
  StatusExecucao: string;

  @ApiProperty()
  Produtos: DealernetBudgetProduto[];
}

export class DealernetBudgetResponse {
  @ApiProperty()
  Chave: number;

  @ApiProperty()
  EmpresaDocumento: number;

  @ApiProperty()
  VeiculoPlaca: string;

  @ApiProperty()
  VeiculoChassi: string;

  @ApiProperty()
  VeiculoKM: number;

  @ApiProperty()
  VeiculoModelo: string;

  @ApiProperty()
  VeiculoAno: number;

  @ApiProperty()
  ClienteDocumento: number;

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
  DiasPrazoEntrega: number;

  @ApiProperty()
  DataValidade: string;

  @ApiProperty()
  DataProximoContato: string;

  @ApiProperty()
  DataPrometida: string;

  @ApiProperty()
  PercentualCombustivel: number;

  @ApiProperty()
  PercentualBateria: number;

  @ApiProperty()
  BloquearProduto: boolean;

  @ApiProperty()
  ObservacaoConsultor: string;

  @ApiProperty()
  Complementar: boolean;

  @ApiProperty()
  ConsultorEntrega: number;

  @ApiProperty()
  ObservacaoPendencia: string;

  @ApiProperty()
  ObsOrigem: string;

  @ApiProperty()
  StatusAutorizacao: string;

  @ApiProperty()
  Mensagem: string;

  @ApiProperty({ type: DealernetBudgetServico })
  Servicos: DealernetBudgetServico;
}
