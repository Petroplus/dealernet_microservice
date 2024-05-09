import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetCustomerResponse } from './response/customers.response';

@Injectable()
export class DealernetCustomerService {
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
}
