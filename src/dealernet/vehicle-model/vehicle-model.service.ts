import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetVehicleModelResponse } from './response/vehicle-model.response';

@Injectable()
export class DealernetVehicleModelService {
  async findById(connection: IntegrationDealernet, id: string): Promise<DealernetVehicleModelResponse> {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    const xmlBody = `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"	xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.MODELOVEICULO>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsmodeloveiculoin>
                  <deal:ModeloVeiculo_Codigo>${id}</deal:ModeloVeiculo_Codigo>
                  <deal:ModeloVeiculo_Descricao>?</deal:ModeloVeiculo_Descricao>
                  <deal:Marca_Descricao>?</deal:Marca_Descricao>
                  <deal:ModeloMontadora_Codigo>?</deal:ModeloMontadora_Codigo>
                </deal:Sdt_fsmodeloveiculoin>
              </deal:WS_FastServiceApi.MODELOVEICULO>
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
      const model: any = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.MODELOVEICULOResponse']['Sdt_fsmodeloveiculoout']['SDT_FSModeloVeiculoOut'];

      if (model.Mensagem) {
        throw new BadRequestException(model.Mensagem);
      }

      return model;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetVehicleService.findById');
      throw error;
    }
  }

  async findByName(connection: IntegrationDealernet, name: string): Promise<DealernetVehicleModelResponse> {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    const xmlBody = `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"	xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.MODELOVEICULO>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsmodeloveiculoin>
                  <deal:ModeloVeiculo_Codigo>?</deal:ModeloVeiculo_Codigo>
                  <deal:ModeloVeiculo_Descricao>${name}</deal:ModeloVeiculo_Descricao>
                  <deal:Marca_Descricao>?</deal:Marca_Descricao>
                  <deal:ModeloMontadora_Codigo>?</deal:ModeloMontadora_Codigo>
                </deal:Sdt_fsmodeloveiculoin>
              </deal:WS_FastServiceApi.MODELOVEICULO>
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
      const model: any = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.MODELOVEICULOResponse']['Sdt_fsmodeloveiculoout']['SDT_FSModeloVeiculoOut'];

      if (model.Mensagem) {
        throw new BadRequestException(model.Mensagem);
      }

      return model;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetVehicleService.findByName');
      throw error;
    }
  }
}
