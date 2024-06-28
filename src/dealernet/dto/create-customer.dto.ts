import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { IsDocument } from 'src/commons/validations/is-document';

class EnderecoItem {
  @ApiProperty()
  PessoaEndereco_TipoEndereco: string;
  @ApiProperty()
  PessoaEndereco_Logradouro: string;
  @ApiProperty()
  PessoaEndereco_TipoLogradouro_Descricao: string;
  @ApiProperty()
  PessoaEndereco_Complemento: string;
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
  @ApiProperty({ required: false })
  @IsOptional()
  Pessoa_Codigo: number;

  @ApiProperty({ type: String, description: 'Nome da pessoa' })
  @IsNotEmpty()
  Pessoa_Nome: string;

  @ApiProperty({ type: String, description: 'Tipo de pessoa' })
  @IsNotEmpty()
  Pessoa_TipoPessoa: string;

  @ApiProperty({ type: String, description: 'Documento de identificação da pessoa' })
  @IsNotEmpty()
  @IsDocument()
  Pessoa_DocIdentificador: string;

  @ApiProperty({ type: Number, description: 'RG ou Inscrição Estadual da pessoa' })
  @IsNotEmpty()
  Pessoa_RG_InscricaoEstadual: number;

  @ApiProperty({ type: String, description: 'Órgão emissor do documento' })
  @IsOptional()
  Pessoa_OrgaoEmissor: string;

  @ApiProperty({ type: String, description: 'Inscrição na Suframa da pessoa' })
  @IsOptional()
  Pessoa_InscricaoSuframa: string;

  @ApiProperty({ type: String, description: 'Inscrição municipal da pessoa' })
  @IsOptional()
  Pessoa_InscricaoMunicipal: string;

  @ApiProperty({ type: String, description: 'Sexo da pessoa' })
  @IsOptional()
  Pessoa_Sexo: string;

  @ApiProperty({ type: String, description: 'Email da pessoa' })
  @IsNotEmpty()
  Pessoa_Email: string;

  @ApiProperty({ type: String, description: 'Estado civil da pessoa' })
  @IsOptional()
  Pessoa_Nacionalidade: string;

  @ApiProperty({ type: String, description: 'Estado civil da pessoa' })
  @IsOptional()
  Pessoa_EstadoCivil: string;

  @ApiProperty({ type: String, description: 'Data de nascimento da pessoa' })
  @IsOptional()
  Pessoa_Nascimento: string;

  @ApiProperty({ type: Number, description: 'DDD do telefone da pessoa' })
  @IsOptional()
  Pessoa_Telefone_DDD: number;

  @ApiProperty({ type: Number, description: 'Telefone da pessoa' })
  @IsOptional()
  Pessoa_Telefone_Fone: number;

  @ApiProperty({ type: String, description: 'Mensagem relacionada à pessoa' })
  @IsOptional()
  Pessoa_Mensagem: string;

  @ApiProperty({ type: EnderecoItem, isArray: true })
  @IsOptional()
  Endereco: EnderecoItem[];

  @ApiProperty({ type: TelefoneItem, isArray: true })
  @IsOptional()
  Telefone: TelefoneItem[];

  @ApiProperty({ type: MeioContatoItem, isArray: true })
  @IsOptional()
  MeioContato: MeioContatoItem[];
}
