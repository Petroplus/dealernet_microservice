export class RequestPartOrderDTO {
  Chave: number | string;
  NumeroOS: number | string;
  Servicos: Servico[];
}

class Servico {
  Chave: number | string;
  ProdutivoDocumento: string | number;
  UsuarioIndResponsavel: string;
  Produtos: Produto[];
}

class Produto {
  Chave: number | string;
  Selecionado: boolean;
}
