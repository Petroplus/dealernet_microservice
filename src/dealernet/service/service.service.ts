/* eslint-disable prettier/prettier */

import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { ServiceFilter } from 'src/modules/service/filters/service.filter';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetServiceTMOResponse } from './response/service.response';

@Injectable()
export class DealernetServiceService {
  async find(connection: IntegrationDealernet, filter: ServiceFilter): Promise<DealernetServiceTMOResponse[]> {
    const xmlBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
      <soapenv:Header/>
      <soapenv:Body>
              <deal:WS_FastServiceApi.TMO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fstmoin>
                    <deal:Empresa_Documento>${connection.document}</deal:Empresa_Documento>
                      <deal:TMO_Codigo>?</deal:TMO_Codigo>
                      <deal:TMO_Descricao>${filter.name || '?'}</deal:TMO_Descricao>
                      <deal:TipoOS_Sigla>V1</deal:TipoOS_Sigla>
                      <deal:Veiculo_PlacaChassi>?</deal:Veiculo_PlacaChassi>
                      ${filter.service_id ? `<deal:TMO_Referencia><deal:item>${filter.service_id}</deal:item></deal:TMO_Referencia>` : ''}
                    </deal:Sdt_fstmoin>
              </deal:WS_FastServiceApi.TMO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    console.log(xmlBody);

    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody).then(({ data }) => new XMLParser().parse(data));
      const parsedData = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.TMOResponse']['Sdt_fstmooutlista']['SDT_FSTMOOut']
      const services = isArray(parsedData) ? parsedData : [parsedData];


      return services.filter((x) => x.TMO_Codigo != "0");
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetServiceService.find');
      throw error;
    }
  }
}
