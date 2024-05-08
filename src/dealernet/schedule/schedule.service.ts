import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';

import { Agendamento } from '../response/agendamento-response';

@Injectable()
export class DealernetScheduleService {
  async find(api: string, user: string, key: string, dataInicio?: string, dataFim?: string, doc?: string): Promise<any[]> {
    if (!dataFim) {
      dataFim = '?';
    }
    if (!dataInicio) {
      dataInicio = new Date().addDays(0).format('yyyy-MM-dd');
    }
    const url = `${api}/aws_fastserviceapi.aspx`;

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.AGENDAMENTO>
                <deal:Usuario>${user}</deal:Usuario>
                <deal:Senha>${key}</deal:Senha>
                <deal:Sdt_fsagendamentoin>
                <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento>
                    <deal:Data>${dataInicio}</deal:Data>
                    <deal:DataFinal>${dataFim}</deal:DataFinal>
                    <deal:Acao>LST</deal:Acao>
                </deal:Sdt_fsagendamentoin>
                </deal:WS_FastServiceApi.AGENDAMENTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      // eslint-disable-next-line prettier/prettier
      const agendamentos: Agendamento | Agendamento[] = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.AGENDAMENTOResponse']['Sdt_fsagendamentooutlista']['SDT_FSAgendamentoOut'];

      if (!isArray(agendamentos)) {
        if (agendamentos.Mensagem || agendamentos.EmpresaDocumento == doc) {
          return [];
        }
        return [agendamentos];
      }

      if (doc) {
        const filteredAgendamentos = agendamentos.filter((agendamento) => Number(agendamento.EmpresaDocumento) == Number(doc));
        console.log(`teste ${filteredAgendamentos.length}`);
        return filteredAgendamentos;
      } else {
        return agendamentos;
      }
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetScheduleService.find');
      throw error;
    }
  }
}
