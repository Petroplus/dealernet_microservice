import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetVehicleResponse } from './response/vehicle.response';

@Injectable()
export class DealernetVehicleService {
  async findByPlate(connection: IntegrationDealernet, plate: string): Promise<DealernetVehicleResponse> {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.VEICULO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fsveiculoin>
                        <deal:Veiculo_Placa>${plate}</deal:Veiculo_Placa>
                        <deal:Veiculo_Chassi>?</deal:Veiculo_Chassi>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fsveiculoin>
                </deal:WS_FastServiceApi.VEICULO>
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
      const veiculo: any = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.VEICULOResponse']['Sdt_fsveiculoout']['SDT_FSVeiculoOut'];

      if (veiculo.Mensagem) {
        throw new BadRequestException(veiculo.Mensagem);
      }

      return veiculo;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetVehicleService.findByPlate');
      throw error;
    }
  }
}
