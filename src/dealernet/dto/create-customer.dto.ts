import { ApiProperty } from '@nestjs/swagger';

class EnderecoItem {
  @ApiProperty()
  PessoaEndereco_TipoEndereco: string;
  @ApiProperty()
  PessoaEndereco_Logradouro: string;
  @ApiProperty()
  PessoaEndereco_TipoLogradouro_Descricao: string;
  @ApiProperty()
  PessoaEndereco_Numero: number;
  @ApiProperty()
  PessoaEndereco_CEP: number;
  @ApiProperty()
  PessoaEndereco_Bairro: string;
  @ApiProperty()
  PessoaEndereco_Cidade: string;
  @ApiProperty()
  PessoaEndereco_Estado: string;
}

class TelefoneItem {
  @ApiProperty()
  PessoaTelefone_Codigo: number;
  @ApiProperty()
  PessoaTelefone_TipoTelefone: string;
  @ApiProperty()
  PessoaTeleFone_DDD: number;
  @ApiProperty()
  PessoaTelefone_Fone: number;
}

class MeioContatoItem {
  @ApiProperty()
  PessoaMeioContato_Tipo: string;
  @ApiProperty()
  PessoaMeioContato_Ativo: boolean;
  @ApiProperty()
  PessoaMeioContato_Principal: boolean;
}

export class CreateCustomerDTO {
  @ApiProperty({ type: String, description: 'Nome da pessoa' })
  Pessoa_Nome: string;

  @ApiProperty({ type: String, description: 'Tipo de pessoa' })
  Pessoa_TipoPessoa: string;

  @ApiProperty({ type: Number, description: 'Documento de identificação da pessoa' })
  Pessoa_DocIdentificador: number;

  @ApiProperty({ type: Number, description: 'RG ou Inscrição Estadual da pessoa' })
  Pessoa_RG_InscricaoEstadual: number;

  @ApiProperty({ type: String, description: 'Órgão emissor do documento' })
  Pessoa_OrgaoEmissor: string;

  @ApiProperty({ type: String, description: 'Inscrição municipal da pessoa' })
  Pessoa_InscricaoMunicipal: string;

  @ApiProperty({ type: String, description: 'Sexo da pessoa' })
  Pessoa_Sexo: string;

  @ApiProperty({ type: String, description: 'Email da pessoa' })
  Pessoa_Email: string;

  @ApiProperty({ type: String, description: 'Data de nascimento da pessoa' })
  Pessoa_Nascimento: string;

  @ApiProperty({ type: String, description: 'Mensagem relacionada à pessoa' })
  Pessoa_Mensagem: string;

  @ApiProperty({
    type: EnderecoItem,
  })
  Endereco: {
    EnderecoItem: EnderecoItem;
  };

  @ApiProperty({
    type: TelefoneItem,
  })
  Telefone: {
    TelefoneItem: TelefoneItem;
  };

  @ApiProperty({
    type: MeioContatoItem,
  })
  MeioContato: {
    MeioContatoItem: MeioContatoItem;
  };
}
