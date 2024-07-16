/* eslint-disable prettier/prettier */

import { Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { ProductFilter } from 'src/modules/product/filters/product.filter';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { ProdutoDealernetResponse } from '../response/produto-response';

@Injectable()
export class DealernetProductService {
  async find(connection: IntegrationDealernet, filter: ProductFilter): Promise<ProdutoDealernetResponse[]> {
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.PRODUTO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fsprodutoin>
                      <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento >
                      <deal:ProdutoCodigo>?</deal:ProdutoCodigo >
                      <deal:ProdutoDescricao>${filter.name || '?'}</deal:ProdutoDescricao>
                      	<deal:ProdutoReferencia>
					                <deal:item>${filter.product_id || '?'}</deal:item>
				                </deal:ProdutoReferencia>
                      <deal:VeiculoPlacaChassi>?</deal:VeiculoPlacaChassi>
                  </deal:Sdt_fsprodutoin>
              </deal:WS_FastServiceApi.PRODUTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    try {

      console.log(xmlBody);

      const client = await dealernet();

      const response = await client.post(url, xmlBody).then(({ data }) => new XMLParser().parse(data));
      const parsedData = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PRODUTOResponse']['Sdt_fsprodutooutlista']['SDT_FSProdutoOut'];

      const products = isArray(parsedData) ? parsedData : [parsedData];

      if (products.filter((x) => x.Mensagem).length > 0) return [];

      return products;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetProductService.find');
      throw error;
    }
  }
}
