export interface DealernetSchedule {
  Chave: number;
  EmpresaDocumento: number;
  VeiculoPlaca: string;
  VeiculoChassi: string;
  VeiculoKM: number;
  VeiculoModelo: string;
  VeiculoAnoCodigo: number;
  ClienteCodigo: number;
  ClienteDocumento: number;
  ClienteNome: string;
  ConsultorDocumento: number;
  ConsultorNome: string;
  Data: string;
  Observacao: string;
  Status: string;
  Mensagem: string;
  Servicos: Servico[];
}

export interface Servico {
  Chave: number;
  TipoOS: number;
  TipoOSSigla: string;
  TMO: number;
  TMOReferencia: string;
  Descricao: string;
  Tempo: number;
  ValorUnitario: number;
  Quantidade: number;
  Desconto: number;
  DescontoPercentual: number;
  Observacao: string;
  Produtivo: number;
  ProdutivoDocumento: string;
  DataPrevisao: string;
  StatusAutorizacao: string;
  StatusAndamento: string;
  StatusDesconto: string;
  KitCodigo: number;
  KitPrecoFechado: boolean;
  CampanhaCodigo: number;
  Produtos: Produto[];
}

export interface Produto {
  Chave: number;
  TipoOS: number;
  TipoOSSigla: string;
  Produto: number;
  ProdutoReferencia: any;
  Descricao: string;
  ValorUnitario: number;
  Quantidade: number;
  Desconto: number;
  DescontoPercentual: number;
  StatusAutorizacao: string;
  StatusDesconto: string;
  KitCodigo: number;
  CampanhaCodigo: number;
}
