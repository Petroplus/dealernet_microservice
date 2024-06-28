import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
                      <deal:TMO_Descricao>${filter.description || '?'}</deal:TMO_Descricao>
                      <deal:TipoOS_Sigla>V1</deal:TipoOS_Sigla>
                      <deal:Veiculo_PlacaChassi>?</deal:Veiculo_PlacaChassi>
                      ${
                        filter.item_ref
                          ? `<deal:TMO_Referencia>
                        <deal:item>${filter.item_ref}</deal:item>
                      </deal:TMO_Referencia>`
                          : ''
                      }

                    </deal:Sdt_fstmoin>
              </deal:WS_FastServiceApi.TMO>
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
      console.log(parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.TMOResponse']);
      // eslint-disable-next-line prettier/prettier
      const TMOS: DealernetServiceTMOResponse | DealernetServiceTMOResponse[] =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.TMOResponse']['Sdt_fstmooutlista']['SDT_FSTMOOut'];

      if (!isArray(TMOS)) {
        if (TMOS.Mensagem) {
          throw new BadRequestException(TMOS.Mensagem);
        }
        return [TMOS];
      }
      return TMOS;
    } catch (error) {
      console.log(error);
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetServiceService.find');
      throw error;
    }
  }
}
