/* eslint-disable prettier/prettier */

import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { CreateCustomerDTO } from '../dto/create-customer.dto';

import { CustomerFilter } from './filters/customer.filter';
import { DealernetCustomerResponse } from './response/customers.response';

@Injectable()
export class DealernetCustomerService {
  async find(connection: IntegrationDealernet, filter: CustomerFilter): Promise<DealernetCustomerResponse[]> {
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Codigo>${filter?.id ?? '?'}</deal:Pessoa_Codigo>
                        <deal:Pessoa_Nome>${filter?.name ?? '?'}</deal:Pessoa_Nome>
                        <deal:Pessoa_DocIdentificador>${filter?.document ?? '?'}</deal:Pessoa_DocIdentificador>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const pessoas = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PESSOAResponse']['Sdt_fspessoaout']['SDT_FSPessoaOut'];

      if (!isArray(pessoas)) {
        return pessoas?.Pessoa_Mensagem ? null : [pessoas];
      } else {
        return pessoas;
      }
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetCustomerService.findById');
      throw error;
    }
  }

  async findById(connection: IntegrationDealernet, id: number): Promise<DealernetCustomerResponse> {
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Nome>?</deal:Pessoa_Nome>
                        <deal:Pessoa_Codigo>${id}</deal:Pessoa_Codigo>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      // eslint-disable-next-line prettier/prettier
      return parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PESSOAResponse']['Sdt_fspessoaout']['SDT_FSPessoaOut'];

    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetCustomerService.findById');
      throw error;
    }
  }

  async findByDocument(connection: IntegrationDealernet, document: string): Promise<DealernetCustomerResponse> {
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Nome>?</deal:Pessoa_Nome>
                        <deal:Pessoa_DocIdentificador>${document}</deal:Pessoa_DocIdentificador>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      // eslint-disable-next-line prettier/prettier
      const pessoa = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PESSOAResponse']['Sdt_fspessoaout']['SDT_FSPessoaOut'];

      if (!isArray(pessoa)) {
        return pessoa?.Pessoa_DocIdentificador != document ? null : pessoa;
      } else {
        const filteredClient = pessoa?.find((cliente) => {
          const docIdentificador = document;
          const paddedDocIdentificador = String(cliente?.Pessoa_DocIdentificador).padStart(docIdentificador.length, '0');
          return docIdentificador === paddedDocIdentificador;
        });
        return filteredClient;
      }
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetCustomerService.findById');
      throw error;
    }
  }

  async createCustomer(connection: IntegrationDealernet, dto: CreateCustomerDTO) {
    const url = `$${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Nome>${dto.Pessoa_Nome ?? '?'}</deal:Pessoa_Nome>
                        <deal:Pessoa_TipoPessoa>${dto.Pessoa_TipoPessoa ?? '?'}</deal:Pessoa_TipoPessoa>
                        <deal:Pessoa_DocIdentificador>${dto.Pessoa_DocIdentificador ?? '?'}</deal:Pessoa_DocIdentificador>
                        <deal:Pessoa_RG>${dto.Pessoa_RG_InscricaoEstadual ?? '?'}</deal:Pessoa_RG>
                        <deal:Pessoa_OrgaoEmissor>${dto.Pessoa_OrgaoEmissor ?? '?'}</deal:Pessoa_OrgaoEmissor>
                        <deal:Pessoa_InscricaoSuframa>?</deal:Pessoa_InscricaoSuframa>
                        <deal:Pessoa_Sexo>${dto.Pessoa_Sexo ?? '?'}</deal:Pessoa_Sexo>
                        <deal:Pessoa_Email>${dto.Pessoa_Email ?? '?'}</deal:Pessoa_Email>
                        <deal:Pessoa_Nacionalidade>?</deal:Pessoa_Nacionalidade>
                        <deal:Pessoa_EstadoCivil>?</deal:Pessoa_EstadoCivil>
                        <deal:Pessoa_Nascimento>${dto.Pessoa_Nascimento ?? '?'}</deal:Pessoa_Nascimento>
                        <deal:Acao>INC</deal:Acao>
                        <deal:Endereco>
                            <deal:EnderecoItem>
                                <deal:PessoaEndereco_TipoEndereco>${dto.Endereco?.EnderecoItem?.PessoaEndereco_TipoEndereco ?? '?'}</deal:PessoaEndereco_TipoEndereco>
                                <deal:PessoaEndereco_Logradouro>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Logradouro ?? '?'}</deal:PessoaEndereco_Logradouro>
                                <deal:PessoaEndereco_TipoLogradouro_Descricao>${dto.Endereco?.EnderecoItem?.PessoaEndereco_TipoLogradouro_Descricao ?? '?'}</deal:PessoaEndereco_TipoLogradouro_Descricao>
                                <deal:PessoaEndereco_Numero>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Numero ?? '?'}</deal:PessoaEndereco_Numero>
                                <deal:PessoaEndereco_Complemento>?}</deal:PessoaEndereco_Complemento>
                                <deal:PessoaEndereco_CEP>${dto.Endereco?.EnderecoItem?.PessoaEndereco_CEP ?? '?'}</deal:PessoaEndereco_CEP>
                                <deal:PessoaEndereco_Bairro>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Bairro ?? '?'}</deal:PessoaEndereco_Bairro>
                                <deal:PessoaEndereco_Cidade>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Cidade ?? '?'}</deal:PessoaEndereco_Cidade>
                                <deal:PessoaEndereco_Estado>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Estado ?? '?'}</deal:PessoaEndereco_Estado>
                            </deal:EnderecoItem>
                        </deal:Endereco>
                        <deal:Telefone>
                            <deal:TelefoneItem>
                                <deal:PessoaTelefone_TipoTelefone>${dto.Telefone?.TelefoneItem?.PessoaTelefone_TipoTelefone ?? '?'}</deal:PessoaTelefone_TipoTelefone>
                                <deal:PessoaTeleFone_DDD>${dto.Telefone?.TelefoneItem?.PessoaTeleFone_DDD ?? '?'}</deal:PessoaTeleFone_DDD>
                                <deal:PessoaTelefone_Fone>${dto.Telefone?.TelefoneItem?.PessoaTelefone_Fone ?? '?'}</deal:PessoaTelefone_Fone>
                            </deal:TelefoneItem>
                        </deal:Telefone>
                        <deal:MeioContato>
                            <deal:MeioContatoItem>
                                <deal:PessoaMeioContato_Tipo>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Ativo ?? '?'}</deal:PessoaMeioContato_Tipo>
                                <deal:PessoaMeioContato_Ativo>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Ativo ?? '?'}</deal:PessoaMeioContato_Ativo>
                                <deal:PessoaMeioContato_Principal>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Principal ?? '?'}</deal:PessoaMeioContato_Principal>
                            </deal:MeioContatoItem>
                        </deal:MeioContato>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      console.log(xmlBody);
      const client = await dealernet();
      const response = await client.post(url, xmlBody);
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async updateCustomer(connection: IntegrationDealernet, dto: CreateCustomerDTO) {
    const url = `$${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Nome>${dto.Pessoa_Nome ?? '?'}</deal:Pessoa_Nome>
                        <deal:Pessoa_TipoPessoa>${dto.Pessoa_TipoPessoa ?? '?'}</deal:Pessoa_TipoPessoa>
                        <deal:Pessoa_DocIdentificador>${dto.Pessoa_DocIdentificador ?? '?'}</deal:Pessoa_DocIdentificador>
                        <deal:Pessoa_RG>${dto.Pessoa_RG_InscricaoEstadual ?? '?'}</deal:Pessoa_RG>
                        <deal:Pessoa_OrgaoEmissor>${dto.Pessoa_OrgaoEmissor ?? '?'}</deal:Pessoa_OrgaoEmissor>
                        <deal:Pessoa_InscricaoSuframa>?</deal:Pessoa_InscricaoSuframa>
                        <deal:Pessoa_Sexo>${dto.Pessoa_Sexo ?? '?'}</deal:Pessoa_Sexo>
                        <deal:Pessoa_Email>${dto.Pessoa_Email ?? '?'}</deal:Pessoa_Email>
                        <deal:Pessoa_Nacionalidade>?</deal:Pessoa_Nacionalidade>
                        <deal:Pessoa_EstadoCivil>?</deal:Pessoa_EstadoCivil>
                        <deal:Pessoa_Nascimento>${dto.Pessoa_Nascimento ?? '?'}</deal:Pessoa_Nascimento>
                        <deal:Acao>ALT</deal:Acao>
                        <deal:Endereco>
                            <deal:EnderecoItem>
                                <deal:PessoaEndereco_TipoEndereco>${dto.Endereco?.EnderecoItem?.PessoaEndereco_TipoEndereco ?? '?'}</deal:PessoaEndereco_TipoEndereco>
                                <deal:PessoaEndereco_Logradouro>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Logradouro ?? '?'}</deal:PessoaEndereco_Logradouro>
                                <deal:PessoaEndereco_TipoLogradouro_Descricao>${dto.Endereco?.EnderecoItem?.PessoaEndereco_TipoLogradouro_Descricao ?? '?'}</deal:PessoaEndereco_TipoLogradouro_Descricao>
                                <deal:PessoaEndereco_Numero>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Numero ?? '?'}</deal:PessoaEndereco_Numero>
                                <deal:PessoaEndereco_Complemento>?}</deal:PessoaEndereco_Complemento>
                                <deal:PessoaEndereco_CEP>${dto.Endereco?.EnderecoItem?.PessoaEndereco_CEP ?? '?'}</deal:PessoaEndereco_CEP>
                                <deal:PessoaEndereco_Bairro>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Bairro ?? '?'}</deal:PessoaEndereco_Bairro>
                                <deal:PessoaEndereco_Cidade>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Cidade ?? '?'}</deal:PessoaEndereco_Cidade>
                                <deal:PessoaEndereco_Estado>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Estado ?? '?'}</deal:PessoaEndereco_Estado>
                            </deal:EnderecoItem>
                        </deal:Endereco>
                        <deal:Telefone>
                            <deal:TelefoneItem>
                                <deal:PessoaTelefone_TipoTelefone>${dto.Telefone?.TelefoneItem?.PessoaTelefone_TipoTelefone ?? '?'}</deal:PessoaTelefone_TipoTelefone>
                                <deal:PessoaTeleFone_DDD>${dto.Telefone?.TelefoneItem?.PessoaTeleFone_DDD ?? '?'}</deal:PessoaTeleFone_DDD>
                                <deal:PessoaTelefone_Fone>${dto.Telefone?.TelefoneItem?.PessoaTelefone_Fone ?? '?'}</deal:PessoaTelefone_Fone>
                            </deal:TelefoneItem>
                        </deal:Telefone>
                        <deal:MeioContato>
                            <deal:MeioContatoItem>
                                <deal:PessoaMeioContato_Tipo>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Ativo ?? '?'}</deal:PessoaMeioContato_Tipo>
                                <deal:PessoaMeioContato_Ativo>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Ativo ?? '?'}</deal:PessoaMeioContato_Ativo>
                                <deal:PessoaMeioContato_Principal>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Principal ?? '?'}</deal:PessoaMeioContato_Principal>
                            </deal:MeioContatoItem>
                        </deal:MeioContato>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const client = await dealernet();
      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      console.log(xmlData);
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }
}
