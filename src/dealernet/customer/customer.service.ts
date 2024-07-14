/* eslint-disable prettier/prettier */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { CreateCustomerDTO } from '../dto/create-customer.dto';

import { CustomerFilter } from './filters/customer.filter';
import { DealernetCustomerResponse } from './response/customers.response';
import { DealernetUserResponse } from './response/user.response';

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

      const response = await client.post(url, xmlBody).then(({ data }) =>
        new XMLParser().parse(data)['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PESSOAResponse']['Sdt_fspessoaout']['SDT_FSPessoaOut']);

      const pessoas = isArray(response) ? response : [response];

      if (pessoas.filter((pessoa) => pessoa?.Pessoa_Mensagem).length > 0) return [];


      return pessoas.map((x) => {
        const document = x?.Pessoa_TipoPessoa == 'F' ? x?.Pessoa_DocIdentificador?.toString().padStart(11, '0') : x?.Pessoa_DocIdentificador?.toString().padStart(14, '0');
        return {
          ...x,
          Pessoa_DocIdentificador: document,
          Endereco: isArray(x?.Endereco?.EnderecoItem) ? x?.Endereco?.EnderecoItem : [x?.Endereco?.EnderecoItem],
          Telefone: isArray(x?.Telefone?.TelefoneItem) ? x?.Telefone?.TelefoneItem : [x?.Telefone?.TelefoneItem],
          MeioContato: isArray(x?.MeioContato?.MeioContatoItem) ? x?.MeioContato?.MeioContatoItem : [x?.MeioContato?.MeioContatoItem],
        };
      });

    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetCustomerService.findById');
      throw error;
    }
  }

  async findById(connection: IntegrationDealernet, id: number): Promise<DealernetCustomerResponse> {
    return this.find(connection, { id }).then((customers) => customers.first());
  }

  async findByDocument(connection: IntegrationDealernet, document: string): Promise<DealernetCustomerResponse> {
    return this.find(connection, { document }).then((customers) => customers.first());
  }

  async upsert(connection: IntegrationDealernet, dto: CreateCustomerDTO) {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    const address = dto.Endereco?.map((Endereco) => `
            <deal:EnderecoItem>
                <deal:PessoaEndereco_TipoEndereco>${Endereco?.PessoaEndereco_TipoEndereco ?? '?'}</deal:PessoaEndereco_TipoEndereco>
                <deal:PessoaEndereco_Logradouro>${Endereco?.PessoaEndereco_Logradouro ?? '?'}</deal:PessoaEndereco_Logradouro>
                <deal:PessoaEndereco_TipoLogradouro_Descricao>${Endereco?.PessoaEndereco_TipoLogradouro_Descricao ?? '?'}</deal:PessoaEndereco_TipoLogradouro_Descricao>
                <deal:PessoaEndereco_Numero>${Endereco?.PessoaEndereco_Numero ?? '?'}</deal:PessoaEndereco_Numero>
                <deal:PessoaEndereco_Complemento>${Endereco?.PessoaEndereco_Complemento ?? '?'}</deal:PessoaEndereco_Complemento>
                <deal:PessoaEndereco_CEP>${Endereco?.PessoaEndereco_CEP ?? '?'}</deal:PessoaEndereco_CEP>
                <deal:PessoaEndereco_Bairro>${Endereco?.PessoaEndereco_Bairro ?? '?'}</deal:PessoaEndereco_Bairro>
                <deal:PessoaEndereco_Cidade>${Endereco?.PessoaEndereco_Cidade ?? '?'}</deal:PessoaEndereco_Cidade>
                <deal:PessoaEndereco_Estado>${Endereco?.PessoaEndereco_Estado ?? '?'}</deal:PessoaEndereco_Estado>
            </deal:EnderecoItem>
            `).join('');

    const phone = dto.Telefone?.map((Telefone) => `
            <deal:TelefoneItem>
                <deal:PessoaTelefone_TipoTelefone>${Telefone?.PessoaTelefone_TipoTelefone ?? '?'}</deal:PessoaTelefone_TipoTelefone>
                <deal:PessoaTeleFone_DDD>${Telefone?.PessoaTeleFone_DDD ?? '?'}</deal:PessoaTeleFone_DDD>
                <deal:PessoaTelefone_Fone>${Telefone?.PessoaTelefone_Fone ?? '?'}</deal:PessoaTelefone_Fone>
            </deal:TelefoneItem>
            `).join('');

    const meioContato = dto.MeioContato?.map((MeioContato) => `
            <deal:MeioContatoItem>
                <deal:PessoaMeioContato_Tipo>${MeioContato?.PessoaMeioContato_Tipo ?? '?'}</deal:PessoaMeioContato_Tipo>
                <deal:PessoaMeioContato_Ativo>${MeioContato?.PessoaMeioContato_Ativo ?? '?'}</deal:PessoaMeioContato_Ativo>
                <deal:PessoaMeioContato_Principal>${MeioContato?.PessoaMeioContato_Principal ?? '?'}</deal:PessoaMeioContato_Principal>
            </deal:MeioContatoItem>
            `).join('');

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Codigo>${dto?.Pessoa_Codigo ?? '?'}</deal:Pessoa_Codigo>
                        <deal:Pessoa_Nome>${dto?.Pessoa_Nome ?? '?'}</deal:Pessoa_Nome>
                        <deal:Pessoa_TipoPessoa>${dto?.Pessoa_TipoPessoa ?? '?'}</deal:Pessoa_TipoPessoa>
                        <deal:Pessoa_DocIdentificador>${dto?.Pessoa_DocIdentificador ?? '?'}</deal:Pessoa_DocIdentificador>
                        <deal:Pessoa_RG_InscricaoEstadual>${dto?.Pessoa_RG_InscricaoEstadual ?? '?'}</deal:Pessoa_RG_InscricaoEstadual>
                        <deal:Pessoa_OrgaoEmissor>${dto?.Pessoa_OrgaoEmissor ?? '?'}</deal:Pessoa_OrgaoEmissor>
                        <deal:Pessoa_InscricaoSuframa>${dto?.Pessoa_InscricaoSuframa ?? '?'}</deal:Pessoa_InscricaoSuframa>
                        <deal:Pessoa_InscricaoMunicipal>${dto?.Pessoa_InscricaoMunicipal ?? '?'}</deal:Pessoa_InscricaoMunicipal>
                        <deal:Pessoa_Sexo>${dto?.Pessoa_Sexo ?? '?'}</deal:Pessoa_Sexo>
                        <deal:Pessoa_Email>${dto?.Pessoa_Email ?? '?'}</deal:Pessoa_Email>
                        <deal:Pessoa_Nacionalidade>${dto?.Pessoa_Nacionalidade ?? '?'}</deal:Pessoa_Nacionalidade>
                        <deal:Pessoa_EstadoCivil>${dto?.Pessoa_EstadoCivil ?? '?'}</deal:Pessoa_EstadoCivil>
                        <deal:Pessoa_Nascimento>${dto?.Pessoa_Nascimento ?? '?'}</deal:Pessoa_Nascimento>
                        <deal:Pessoa_Telefone_DDD>${dto?.Pessoa_Telefone_DDD ?? '?'}</deal:Pessoa_Telefone_DDD>
                        <deal:Pessoa_Telefone_Fone>${dto?.Pessoa_Telefone_Fone ?? '?'}</deal:Pessoa_Telefone_Fone>
                        <deal:Acao>${dto?.Pessoa_Codigo ? 'ALT' : 'INC'}</deal:Acao>
                        <deal:Endereco>
                            ${address ?? ''}
                        </deal:Endereco>
                        <deal:Telefone>
                             ${phone ?? ''}
                        </deal:Telefone>
                        <deal:MeioContato>
                            ${meioContato ?? ''}
                        </deal:MeioContato>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    const client = await dealernet();

    console.log(xmlBody);

    await client.post(url, xmlBody).catch((err) => {
      Logger.error('Erro ao fazer a requisição:', err, 'DealernetCustomerService.upsert');
      throw new BadRequestException('Erro ao fazer a requisição', { description: 'Não foi possível salvar as informações do cliente' });
    });

  }

  async findUsers(connection: IntegrationDealernet, type?: 'PRD' | 'CNT'): Promise<DealernetUserResponse[]> {
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
          <soapenv:Header/>
          <soapenv:Body>
              <deal:WS_FastServiceApi.USUARIOS>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsusuariosin>
                    <deal:PerfilAcesso_Tipo>${type ?? 'PRD'}</deal:PerfilAcesso_Tipo>
                </deal:Sdt_fsusuariosin>
              </deal:WS_FastServiceApi.USUARIOS>
          </soapenv:Body>
        </soapenv:Envelope>
        `;
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    try {
      const client = await dealernet();

      console.log(xmlBody);

      const response = await client.post(url, xmlBody).then(({ data }) =>
        new XMLParser().parse(data)['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.USUARIOSResponse']['Sdt_fsusuariosout']['SDT_FSUsuariosOut']
      )

      const parsedData = isArray(response) ? response : [response];

      return parsedData


    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetCustomerService.findUser');
      throw error;
    }
  }

  async findUser(connection: IntegrationDealernet, doc?: string, type?: 'PRD' | 'CNT'): Promise<DealernetUserResponse> {
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
          <soapenv:Header/>
          <soapenv:Body>
              <deal:WS_FastServiceApi.USUARIOS>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsusuariosin>
                    <deal:PerfilAcesso_Tipo>${type ?? 'PRD'}</deal:PerfilAcesso_Tipo>
                </deal:Sdt_fsusuariosin>
              </deal:WS_FastServiceApi.USUARIOS>
          </soapenv:Body>
        </soapenv:Envelope>
        `;
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    try {
      const client = await dealernet();

      console.log(xmlBody);

      const response = await client.post(url, xmlBody).then(({ data }) =>
        new XMLParser().parse(data)['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.USUARIOSResponse']['Sdt_fsusuariosout']['SDT_FSUsuariosOut']
      )

      const parsedData = isArray(response) ? response : [response];

      return parsedData?.find(user => user.Usuario_DocIdentificador == doc)


    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetCustomerService.findUser');
      throw error;
    }
  }
}
