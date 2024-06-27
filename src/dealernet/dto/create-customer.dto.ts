import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

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
  @IsNotEmpty()
  Pessoa_Nome: string;

  @ApiProperty({ type: String, description: 'Tipo de pessoa' })
  @IsNotEmpty()
  Pessoa_TipoPessoa: string;

  @ApiProperty({ type: Number, description: 'Documento de identificação da pessoa' })
  @IsNotEmpty()
  Pessoa_DocIdentificador: number;

  @ApiProperty({ type: Number, description: 'RG ou Inscrição Estadual da pessoa' })
  @IsNotEmpty()
  Pessoa_RG_InscricaoEstadual: number;

  @ApiProperty({ type: String, description: 'Órgão emissor do documento' })
  @IsOptional()
  Pessoa_OrgaoEmissor: string;

  @ApiProperty({ type: String, description: 'Inscrição municipal da pessoa' })
  @IsOptional()
  Pessoa_InscricaoMunicipal: string;

  @ApiProperty({ type: String, description: 'Sexo da pessoa' })
  @IsOptional()
  Pessoa_Sexo: string;

  @ApiProperty({ type: String, description: 'Email da pessoa' })
  @IsNotEmpty()
  Pessoa_Email: string;

  @ApiProperty({ type: String, description: 'Data de nascimento da pessoa' })
  @IsOptional()
  Pessoa_Nascimento: string;

  @ApiProperty({ type: String, description: 'Mensagem relacionada à pessoa' })
  @IsOptional()
  Pessoa_Mensagem: string;

  @ApiProperty({ type: EnderecoItem })
  @IsOptional()
  Endereco: { EnderecoItem: EnderecoItem };

  @ApiProperty({ type: TelefoneItem })
  @IsOptional()
  Telefone: { TelefoneItem: TelefoneItem };

  @ApiProperty({ type: MeioContatoItem })
  @IsOptional()
  MeioContato: { MeioContatoItem: MeioContatoItem };
}
