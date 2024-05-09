import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetSchedule } from './response/schedule-response';

@Injectable()
export class DealernetScheduleService {
  async find(connection: IntegrationDealernet, start_date?: Date, end_date?: Date): Promise<any[]> {
    const dataInicio = start_date?.format('yyyy-MM-dd') ?? new Date().addDays(0).format('yyyy-MM-dd');
    const dataFim = end_date?.format('yyyy-MM-dd') ?? '?';

    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.AGENDAMENTO>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsagendamentoin>
                <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
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
      const agendamentos: DealernetSchedule | DealernetSchedule[] = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.AGENDAMENTOResponse']['Sdt_fsagendamentooutlista']['SDT_FSAgendamentoOut'];

      if (!isArray(agendamentos)) {
        if (agendamentos.Mensagem) {
          throw new BadRequestException(
            `Não foi possível obter os agendamentos da concessionária ${connection.client_id}`,
            agendamentos.Mensagem
          );
        }
        return [agendamentos];
      }

      if (connection.document) {
        const filteredAgendamentos = agendamentos.filter(
          (agendamento) => Number(agendamento.EmpresaDocumento) == Number(connection.document)
        );

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
