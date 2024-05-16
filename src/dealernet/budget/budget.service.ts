import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { ProductFilter } from 'src/modules/product/filters/product.filter';
import { ProdutoDealernetResponse } from '../response/produto-response';
import { DealernetBudgetResponse } from '../response/budget-response';
import { CreateDealernetOsDTO } from '../order/dto/create-order.dto';
import { CreateDealernetBudgetDTO } from './dto/create-budget.dto';

@Injectable()
export class DealernetBudgetService {
  async find(connection: IntegrationDealernet, integration_id: string): Promise<DealernetBudgetResponse> {
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.ORCAMENTO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                    <deal:Sdt_fsorcamentoin>
                      <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento >
                      <deal:Chave>${integration_id}</deal:Chave>
                      <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fsorcamentoin>
              </deal:WS_FastServiceApi.ORCAMENTO>
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
      const budget =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORCAMENTOResponse']['Sdt_fsorcamentoout'];

      if (budget.Mensage) {
        throw new BadRequestException(budget.Mensagem);
      }
      return budget;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetProductService.find');
      throw error;
    }
  }

  async createXmlSchema(connection: IntegrationDealernet, dto: CreateDealernetBudgetDTO): Promise<string> {
    Logger.log(`Criando Schema  Budget Dealernet`, 'Budget');
    const services =
      dto.servicos.length > 0
        ? `
    <deal:Servicos>
    ${dto.servicos
      .map((item) => {
        const products =
          item.produtos.length > 0
            ? `
      <deal:Produtos>
      ${item.produtos
        .map((product) => {
          return `
      <deal:Produto>
        <deal:TipoOSSigla>${product.tipo_os_sigla}</deal:TipoOSSigla>
        <deal:ProdutoReferencia>${product.produto_referencia}</deal:ProdutoReferencia>
        <deal:ValorUnitario>${product.valor_unitario}</deal:ValorUnitario>
        <deal:Quantidade>${product.quantidade}</deal:Quantidade>
      </deal:Produto>
        `;
        })
        .join('\n')}
      </deal:Produtos>
      `
            : '';

        return `
        <deal:Servico>
        <deal:TipoOSSigla>${item.tipo_os_sigla}</deal:TipoOSSigla>
        <deal:TMOReferencia>${item.tmo_referencia}</deal:TMOReferencia>
        <deal:Tempo>${item.tempo}</deal:Tempo>
        <deal:ValorUnitario>${item.valor_unitario}</deal:ValorUnitario>
        <deal:Quantidade>${item.quantidade}</deal:Quantidade>
         ${products}
        </deal:Servico>
    `;
      })
      .join('\n')}
    </deal:Servicos>
    `
        : '';
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.ORCAMENTO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                  <deal:Sdt_fsorcamentoin>
                    <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
                    <deal:VeiculoPlacaChassi>${dto.veiculo_placa_chassi ?? '?'}</deal:VeiculoPlacaChassi>
                    <deal:VeiculoKM>${dto.veiculo_Km ?? '?'}</deal:VeiculoKM>
                    <deal:ClienteDocumento>${dto.cliente_documento ?? '?'}</deal:ClienteDocumento>
                    <deal:ConsultorDocumento>${dto.consultor_documento ?? '?'}</deal:ConsultorDocumento>
                    <deal:Observacao>${dto.observacao ?? '?'}</deal:Observacao>
                    <deal:DiasPrazoEntrega>${dto.dias_prazo_entrega ?? '?'}</deal:DiasPrazoEntrega>
                    <deal:DataValidade>${dto.data_validade ?? '?'}</deal:DataValidade>
                    <deal:DataProximoContato>${dto.data_proximo_contato ?? '?'}</deal:DataProximoContato>
                    <deal:DataPrometida>${dto.data_prometida ?? '?'}</deal:DataPrometida>
                    <deal:Acao>INC</deal:Acao>
                    ${services}
                </deal:Sdt_fsorcamentoin>
            </deal:WS_FastServiceApi.ORCAMENTO>
       </soapenv:Body>
    </soapenv:Envelope>
        `;

    return xmlBody;
  }

  async create(connection: IntegrationDealernet, dto: CreateDealernetBudgetDTO): Promise<DealernetBudgetResponse> {
    Logger.log(`Criando Budget Dealernet`, 'Budget');
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = await this.createXmlSchema(connection, dto);
    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);
      const budget: DealernetBudgetResponse =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORCAMENTOResponse']['Sdt_fsorcamentoout'];

      if (budget.Mensagem && budget.Chave === 0) {
        throw new BadRequestException(budget.Mensagem);
      }
      return budget;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetBudgetService.create');
      throw error;
    }
  }
}
