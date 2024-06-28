export interface DealernetCustomerResponse {
  Pessoa_Codigo: number;
  Pessoa_Nome: string;
  Pessoa_TipoPessoa: string;
  Pessoa_DocIdentificador: number;
  Pessoa_RG_InscricaoEstadual: number;
  Pessoa_OrgaoEmissor: string;
  Pessoa_InscricaoSuframa: string;
  Pessoa_InscricaoMunicipal: string;
  Pessoa_Sexo: string;
  Pessoa_Email: string;
  Pessoa_Nacionalidade: string;
  Pessoa_EstadoCivil: string;
  Pessoa_Nascimento: string;
  Pessoa_Mensagem: string;
  Endereco: Endereco[];
  Telefone: Telefone[];
  MeioContato: MeioContato[];
}

class Endereco {
  PessoaEndereco_TipoEndereco: string;
  PessoaEndereco_Logradouro: string;
  PessoaEndereco_TipoLogradouro_Descricao: string;
  PessoaEndereco_Complemento: string;
  PessoaEndereco_Numero: number;
  PessoaEndereco_CEP: number;
  PessoaEndereco_Bairro: string;
  PessoaEndereco_Cidade: string;
  PessoaEndereco_Estado: string;
}

class Telefone {
  PessoaTelefone_Codigo: number;
  PessoaTelefone_TipoTelefone: string;
  PessoaTeleFone_DDD: number;
  PessoaTelefone_Fone: number;
}

class MeioContato {
  PessoaMeioContato_Tipo: string;
  PessoaMeioContato_Ativo: boolean;
  PessoaMeioContato_Principal: boolean;
}
