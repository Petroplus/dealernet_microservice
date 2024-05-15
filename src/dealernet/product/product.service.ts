import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { CreateCustomerDTO } from '../dto/create-customer.dto';
import { ProductFilter } from 'src/modules/product/filters/product.filter';
import { ProdutoDealernetResponse } from '../response/produto-response';

@Injectable()
export class DealernetProductService {
  async find(
    connection: IntegrationDealernet,
    filter: ProductFilter
  ): Promise<ProdutoDealernetResponse[] | ProdutoDealernetResponse> {
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.PRODUTO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fsprodutoin>
                      <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento >
                      <deal:ProdutoCodigo>${filter.code || '?'}</deal:ProdutoCodigo >
                      <deal:ProdutoDescricao>${filter.description || '?'}</deal:ProdutoDescricao>
                      <deal:VeiculoPlacaChassi>?</deal:VeiculoPlacaChassi>
                  </deal:Sdt_fsprodutoin>
              </deal:WS_FastServiceApi.PRODUTO>
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
      const products =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PRODUTOResponse']['Sdt_fsprodutooutlista'][
          'SDT_FSProdutoOut'
        ];

      return products;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetProductService.find');
      throw error;
    }
  }
}
