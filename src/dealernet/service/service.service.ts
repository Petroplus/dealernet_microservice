/* eslint-disable prettier/prettier */

import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';

import { parserJsonToXml, parserXmlToJson } from 'src/commons';
import { dealernet } from 'src/commons/web-client';
import { ServiceFilter } from 'src/modules/service/filters/service.filter';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetServiceTMOResponse } from './response/service.response';

@Injectable()
export class DealernetServiceService {
  async find(connection: IntegrationDealernet, filter: ServiceFilter): Promise<DealernetServiceTMOResponse[]> {

    const references = (filter.service_ids?.map((x) => ({ item: x })) ?? []);
    if (filter.service_id) references.push({ item: filter.service_id });

    const body = {
      Empresa_Documento: connection.document,
      TMO_Codigo: '?',
      TMO_Descricao: filter.name,
      TipoOS_Sigla: filter.os_type_acronym,
      TMO_Referencia: references,
    }

    const xmlBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
      <soapenv:Header/>
      <soapenv:Body>
              <deal:WS_FastServiceApi.TMO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fstmoin>
                    <deal:Empresa_Documento>${connection.document}</deal:Empresa_Documento>
                      ${parserJsonToXml(body)}
                    </deal:Sdt_fstmoin>
              </deal:WS_FastServiceApi.TMO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    console.log(xmlBody);

    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody).then(async ({ data }) => await parserXmlToJson(data));
      const parsedData = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.TMOResponse']['Sdt_fstmooutlista']['SDT_FSTMOOut']
      const services = isArray(parsedData) ? parsedData : [parsedData];

      if (services.filter((x) => x.TMO_Codigo != "0").length === 0) return [];

      return services.map((service) => ({
        ...service,
        TMO_Codigo: Number(service.TMO_Codigo),
        TipoOS_Codigo: Number(service.TipoOS_Codigo),
        Tempo: Number(service.Tempo),
        Valor: Number(service.Valor),
        TMOTempo_Ativo: Boolean(service.TMOTempo_Ativo),
        Cobrar: Boolean(service.Cobrar),
      }));
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetServiceService.find');
      throw error;
    }
  }
}
