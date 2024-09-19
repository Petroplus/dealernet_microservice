import { ApiProperty } from '@nestjs/swagger';

export class Marcacao {
  @ApiProperty()
  Chave?: number;

  @ApiProperty()
  UsuarioDocumentoProdutivo: number | string;

  @ApiProperty()
  DataInicial: string;

  @ApiProperty()
  DataFinal: string;

  @ApiProperty()
  MotivoParada: number | string;

  @ApiProperty()
  Observacao?: string;
}

export class Produto {
  @ApiProperty()
  Chave: number;

  @ApiProperty()
  TipoOS: number;

  @ApiProperty()
  TipoOSSigla: string;

  @ApiProperty()
  Produto: number;

  @ApiProperty()
  ProdutoReferencia: string | number;

  @ApiProperty()
  Descricao: string;

  @ApiProperty()
  ValorUnitario: number;

  @ApiProperty()
  Quantidade: number;

  @ApiProperty()
  Desconto: number;

  @ApiProperty()
  DescontoPercentual: number;

  @ApiProperty()
  StatusAutorizacao: string;

  @ApiProperty()
  StatusDesconto: string;

  @ApiProperty()
  KitCodigo: number;

  @ApiProperty()
  CampanhaCodigo: number;
}

export class Servico {
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
  TempoEficiencia: number;

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
  ProdutivoDocumento: number;

  @ApiProperty()
  UsuarioIndResponsavel: string;

  @ApiProperty()
  DataPrevisao: string;

  @ApiProperty()
  Executar: boolean;

  @ApiProperty()
  Cobrar: boolean;

  @ApiProperty()
  ExigeTeste: boolean;

  @ApiProperty()
  StatusAutorizacao: string;

  @ApiProperty()
  StatusAndamento: string;

  @ApiProperty()
  StatusDesconto: string;

  @ApiProperty()
  SolicitadoCliente: boolean;

  @ApiProperty()
  KitCodigo: number;

  @ApiProperty()
  KitPrecoFechado: boolean;

  @ApiProperty()
  CampanhaCodigo: number;

  @ApiProperty()
  StatusExecucao: string;

  @ApiProperty()
  Produtos: Produto[];

  @ApiProperty({ type: Marcacao })
  Marcacoes: Marcacao[];
}

export class TipoOSItem {
  @ApiProperty()
  TipoOS: number;

  @ApiProperty()
  TipoOSSigla: string;

  @ApiProperty()
  TipoOSClassificacao: string;

  @ApiProperty()
  Consultor: string;

  @ApiProperty()
  ConsultorDocumento: number;

  @ApiProperty()
  StatusAndamento: string;

  @ApiProperty()
  DataEncerramento: string;

  @ApiProperty()
  CondicaoPagamento: number;
}

export class TipoOS {
  @ApiProperty({ type: [TipoOSItem] })
  TipoOSItem: TipoOSItem[] | TipoOSItem;
}

export class DealernetOrder {
  @ApiProperty()
  Chave: number;

  @ApiProperty()
  NumeroOS: number;

  @ApiProperty()
  EmpresaDocumento: number;

  @ApiProperty()
  VeiculoPlaca: string;

  @ApiProperty()
  VeiculoChassi: string;

  @ApiProperty()
  VeiculoKM: number;

  @ApiProperty()
  ModeloVeiculo: string;

  @ApiProperty()
  VeiculoMarca: string;

  @ApiProperty()
  VeiculoAnoModelo: number;

  @ApiProperty()
  VeiculoAnoFabricacao: number;

  @ApiProperty()
  ClienteCodigo: number;

  @ApiProperty()
  ClienteDocumento: number;

  @ApiProperty()
  ClienteNome: string;

  @ApiProperty()
  Data: string;

  @ApiProperty()
  Observacao: string;

  @ApiProperty()
  DiasPrazoEntrega: number;

  @ApiProperty()
  DataProximoContato: string;

  @ApiProperty()
  DataPrometida: string;

  @ApiProperty()
  CondicaoPagamento: number;

  @ApiProperty()
  PercentualCombustivel: number;

  @ApiProperty()
  PercentualBateria: number;

  @ApiProperty()
  ExigeLavagem: boolean;

  @ApiProperty()
  ClienteAguardando: boolean;

  @ApiProperty()
  ClienteRetorno: string;

  @ApiProperty()
  InspecionadoElevador: boolean;

  @ApiProperty()
  BloquearProduto: boolean;

  @ApiProperty()
  CorPrisma_Codigo: number;

  @ApiProperty()
  NroPrisma: string;

  @ApiProperty()
  TipoOSSigla: string;

  @ApiProperty()
  ExisteObjetoValor: boolean;

  @ApiProperty()
  Mensagem: string;

  @ApiProperty()
  Servicos: Servico[];

  @ApiProperty()
  TipoOS: TipoOSItem[];
}

export class DealernetOrderResponse {
  @ApiProperty()
  Chave: number;

  @ApiProperty()
  NumeroOS: number;

  @ApiProperty()
  EmpresaDocumento: number;

  @ApiProperty()
  VeiculoPlaca: string;

  @ApiProperty()
  VeiculoChassi: string;

  @ApiProperty()
  VeiculoKM: number;

  @ApiProperty()
  ModeloVeiculo: string;

  @ApiProperty()
  VeiculoMarca: string;

  @ApiProperty()
  VeiculoAnoModelo: number;

  @ApiProperty()
  VeiculoAnoFabricacao: number;

  @ApiProperty()
  ClienteCodigo: number;

  @ApiProperty()
  ClienteDocumento: number;

  @ApiProperty()
  ClienteNome: string;

  @ApiProperty()
  Data: string;

  @ApiProperty()
  Observacao: string;

  @ApiProperty()
  DiasPrazoEntrega: number;

  @ApiProperty()
  DataProximoContato: string;

  @ApiProperty()
  DataPrometida: string;

  @ApiProperty()
  CondicaoPagamento: number;

  @ApiProperty()
  PercentualCombustivel: number;

  @ApiProperty()
  PercentualBateria: number;

  @ApiProperty()
  ExigeLavagem: boolean;

  @ApiProperty()
  ClienteAguardando: boolean;

  @ApiProperty()
  ClienteRetorno: string;

  @ApiProperty()
  InspecionadoElevador: boolean;

  @ApiProperty()
  BloquearProduto: boolean;

  @ApiProperty()
  CorPrisma_Codigo: number;

  @ApiProperty()
  NroPrisma: string;

  @ApiProperty()
  TipoOSSigla: string;

  @ApiProperty()
  ExisteObjetoValor: boolean;

  @ApiProperty()
  Mensagem: string;

  @ApiProperty({ type: Servico })
  Servicos: Servico[];

  @ApiProperty({ type: TipoOSItem })
  TipoOS: TipoOSItem[];
}
