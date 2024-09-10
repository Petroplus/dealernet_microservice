import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { IsDocument } from 'src/commons/validations/is-document';

export class EnderecoItem {
  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_TipoEndereco: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_Logradouro: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_TipoLogradouro_Descricao: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_Complemento: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_Numero: number;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_CEP: number;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_Bairro: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_Cidade: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaEndereco_Estado: string;
}

export class TelefoneItem {
  @ApiProperty({ required: false })
  @IsOptional()
  PessoaTelefone_Codigo: number;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaTelefone_TipoTelefone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaTeleFone_DDD: number;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaTelefone_Fone: number;
}

export class MeioContatoItem {
  @ApiProperty({ required: false })
  @IsOptional()
  PessoaMeioContato_Tipo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  PessoaMeioContato_Ativo: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
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

  @ApiProperty({ type: Number, description: 'RG ou Inscrição Estadual da pessoa', required: false })
  @IsOptional()
  Pessoa_RG_InscricaoEstadual: number;

  @ApiProperty({ type: String, description: 'Órgão emissor do documento', required: false })
  @IsOptional()
  Pessoa_OrgaoEmissor: string;

  @ApiProperty({ type: String, description: 'Inscrição na Suframa da pessoa', required: false })
  @IsOptional()
  Pessoa_InscricaoSuframa: string;

  @ApiProperty({ type: String, description: 'Inscrição municipal da pessoa', required: false })
  @IsOptional()
  Pessoa_InscricaoMunicipal: string;

  @ApiProperty({ type: String, description: 'Sexo da pessoa', required: false })
  @IsOptional()
  Pessoa_Sexo: string;

  @ApiProperty({ type: String, description: 'Email da pessoa' })
  @IsNotEmpty()
  Pessoa_Email: string;

  @ApiProperty({ type: String, description: 'Estado civil da pessoa', required: false })
  @IsOptional()
  Pessoa_Nacionalidade: string;

  @ApiProperty({ type: String, description: 'Estado civil da pessoa', required: false })
  @IsOptional()
  Pessoa_EstadoCivil: string;

  @ApiProperty({ type: String, description: 'Data de nascimento da pessoa', required: false })
  @IsOptional()
  Pessoa_Nascimento: string;

  @ApiProperty({ type: Number, description: 'DDD do telefone da pessoa', required: false })
  @IsOptional()
  Pessoa_Telefone_DDD: number;

  @ApiProperty({ type: Number, description: 'Telefone da pessoa', required: false })
  @IsOptional()
  Pessoa_Telefone_Fone: number;

  @ApiProperty({ type: String, description: 'Mensagem relacionada à pessoa', required: false })
  @IsOptional()
  Pessoa_Mensagem: string;

  @ApiProperty({ type: EnderecoItem, isArray: true, required: false })
  @IsOptional()
  Endereco: EnderecoItem[];

  @ApiProperty({ type: TelefoneItem, isArray: true, required: false })
  @IsOptional()
  Telefone: TelefoneItem[];

  @ApiProperty({ type: MeioContatoItem, isArray: true, required: false })
  @IsOptional()
  MeioContato: MeioContatoItem[];
}
