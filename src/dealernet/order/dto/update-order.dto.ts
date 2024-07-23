export class UpdateDealernetProductDTO {
  Chave: number;
  TipoOSSigla: string;
  Produto: number | string;
  ProdutoReferencia: number | string;
  ValorUnitario: number;
  Quantidade: number;
  Desconto?: number;
  DescontoPercentual?: number;
  KitCodigo?: number;
  CampanhaCodigo?: number;
  Selecionado?: boolean;
  StatusExecucao?: string;
  VendedorRequisicaoDocumento?: string;
}

export class UpdateDealernetMarcacaoDto {
  Chave?: number;
  UsuarioDocumentoProdutivo: number | string;
  DataInicial: string;
  DataFinal?: string;
  MotivoParada?: number | string;
  Observacao?: string;
}

export class UpdateDealernetServiceDTO {
  Chave?: number;
  TipoOSSigla: string;
  TMOReferencia: string;
  Tempo: number;
  ValorUnitario: number;
  Quantidade: number;
  Desconto?: number;
  DescontoPercentual?: number;
  Observacao?: string;
  ProdutivoDocumento: string;
  UsuarioIndResponsavel: string;
  Executar?: boolean;
  Cobrar: boolean;
  DataPrevisao?: string;
  KitCodigo?: number;
  KitPrecoFechado?: boolean;
  CampanhaCodigo?: number;
  Selecionado?: boolean;
  StatusExecucao?: string;
  SetorExecucao?: string;
  Produtos?: any[];
  Marcacoes?: any[];
}

export class UpdateDealernetTipoOSDto {
  TipoOSSigla: string;
  ConsultorDocumento: number | string;
  CondicaoPagamento: number | string;
}

export class UpdateDealernetOsDTO {
  Chave: number;
  NumeroOS: number;
  VeiculoPlacaChassi: string;
  VeiculoKM: number;
  ClienteCodigo: number | string;
  ClienteDocumento: number | string;
  CondutorCodigo?: number | string;
  ConsultorDocumento?: number | string;
  Data: string;
  DataFinal?: string;
  Status?: string;
  Observacao: string;
  DataPrometida: string;
  PercentualCombustivel: number;
  PercentualBateria: number;
  ExigeLavagem: boolean;
  ClienteAguardando: boolean;
  InspecionadoElevador: boolean;
  BloquearProduto: boolean;
  CorPrisma_Codigo: number;
  NroPrisma: string;
  OSEntregaDomicilio?: boolean;
  ObservacaoConsultor?: string;
  TipoOSSigla?: string;
  ExisteObjetoValor?: boolean;
  CarregarBateria?: boolean;
  Servicos?: UpdateDealernetServiceDTO[];
  TipoOS?: UpdateDealernetTipoOSDto[];
}
