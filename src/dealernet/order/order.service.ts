/* eslint-disable prettier/prettier */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

import { parserJsonToXml } from 'src/commons';
import { dealernet } from 'src/commons/web-client';
import { OrderFilter } from 'src/modules/os/filters/order.filters';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetOrder, DealernetOrderResponse } from '../response/os-response';

import { CreateDealernetOsDTO } from './dto/create-order.dto';
import { RequestPartOrderDTO } from './dto/request-part-order.dto';
import { UpdateDealernetOsDTO } from './dto/update-order.dto';

@Injectable()
export class DealernetOsService {

  async find(connection: IntegrationDealernet, filter?: OrderFilter): Promise<DealernetOrderResponse[]> {

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                  <deal:Sdt_fsordemservicoin>
                    <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
                    <deal:Chave>${filter?.integration_id ?? '?'}</deal:Chave>
                    <deal:NumeroOS>${filter?.os_number ?? '?'}</deal:NumeroOS>
                    <deal:VeiculoPlacaChassi>${filter?.veiculoPlacaChassi ?? '?'}</deal:VeiculoPlacaChassi>
                    <deal:Data>${filter?.dataInicio}</deal:Data>
                    <deal:DataFinal>${filter?.dataFim ?? '?'}</deal:DataFinal>
                    <deal:Status>${filter?.status ?? '?'}</deal:Status>
                    <deal:Acao>LST</deal:Acao>
                  <deal:Acao>LST</deal:Acao>
                  </deal:Sdt_fsordemservicoin>
              </deal:WS_FastServiceApi.ORDEMSERVICO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    try {
      const client = await dealernet({ retries: 3 });

      const response = await client.post(url, xmlBody).then((response) => new XMLParser().parse(response.data));
      const parsedData = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista']['SDT_FSOrdemServicoOut'];

      const orders = Array.isArray(parsedData) ? parsedData : [parsedData];

      if (orders[0].Chave === 0) throw new BadRequestException(orders[0].Mensagem);

      return orders.map((order) => {
        const Servicos = (Array.isArray(order.Servicos?.Servico) ? order.Servicos.Servico : order.Servicos?.Servico ? [order.Servicos.Servico] : []).map((servico: any) => {
          const Produtos = Array.isArray(servico.Produtos?.Produto) ? servico.Produtos.Produto : servico.Produtos?.Produto ? [servico.Produtos.Produto] : [];

          return { ...servico, Produtos }
        });

        const TipoOS = Array.isArray(order.TipoOS?.TipoOSItem) ? order.TipoOS.TipoOSItem : order.TipoOS?.TipoOSItem ? [order.TipoOS.TipoOSItem] : [];

        return { ...order, Servicos, TipoOS }
      }) as any;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.findOS');
      throw error;
    }
  }

  async findByOsNumber(connection: IntegrationDealernet, os_number: string | number): Promise<DealernetOrderResponse> {
    return this.find(connection, { os_number: os_number?.toString() }).then((orders) => orders.first());
  }

  async createOsXmlSchema(connection: IntegrationDealernet, dto: CreateDealernetOsDTO): Promise<string> {
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
        <deal:Cobrar>${item.cobra}</deal:Cobrar>
        <deal:Observacao>${item?.observacao ?? ''}</deal:Observacao>
        ${item?.produtivo_documento ? `<deal:ProdutivoDocumento>${item.produtivo_documento}</deal:ProdutivoDocumento>` : ''}
        ${item?.usuario_ind_responsavel ? `<deal:UsuarioIndResponsavel>${item.usuario_ind_responsavel}</deal:UsuarioIndResponsavel>` : ''}
        ${item?.setor_execucao ? `<deal:SetorExecucao>${item.setor_execucao}</deal:SetorExecucao>` : ''}
         ${products}
        </deal:Servico>
    `;
          })
          .join('\n')}
    </deal:Servicos>
    `
        : '';

    const os_tipos = dto.tipo_os_types.map(({ tipo_os_sigla, consultor_documento, condicao_pagamento }) => {
      return `
          <deal:TipoOSItem>
            <deal:TipoOSSigla>${tipo_os_sigla ?? '?'}</deal:TipoOSSigla>
            <deal:ConsultorDocumento>${consultor_documento ?? '?'}</deal:ConsultorDocumento>
            <deal:CondicaoPagamento>${condicao_pagamento ?? '?'}</deal:CondicaoPagamento>
          </deal:TipoOSItem>`
    }).join('\n');

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.ORDEMSERVICO>
                  <deal:Usuario>${connection.user}</deal:Usuario>
                  <deal:Senha>${connection.key}</deal:Senha>
                  <deal:Sdt_fsordemservicoin>
                    <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
                    <deal:VeiculoPlacaChassi>${dto.veiculo_placa_chassi ?? '?'}</deal:VeiculoPlacaChassi>
                    <deal:VeiculoKM>${dto.veiculo_Km ?? '?'}</deal:VeiculoKM>
                    <deal:ClienteDocumento>${dto.cliente_documento ?? '?'}</deal:ClienteDocumento>
                    <deal:ConsultorDocumento>${dto.consultor_documento ?? '?'}</deal:ConsultorDocumento>
                    <deal:Data>${dto.data ?? '?'}</deal:Data>
                    <deal:DataFinal>${dto.data_final ?? '?'}</deal:DataFinal>
                    <deal:Status>${dto.status ?? '?'}</deal:Status>
                    <deal:Observacao>${dto.observacao ?? '?'}</deal:Observacao>
                    <deal:DataPrometida>${dto.data_prometida ?? '?'}</deal:DataPrometida>
                    <deal:PercentualCombustivel>${dto.percentual_combustivel ?? '?'}</deal:PercentualCombustivel>
                    <deal:PercentualBateria>${dto.percentual_bateria ?? '?'}</deal:PercentualBateria>
                    <deal:ExigeLavagem>${dto.exige_lavagem ?? '?'}</deal:ExigeLavagem>
                    <deal:ClienteAguardando>${dto.cliente_aguardando ?? '?'}</deal:ClienteAguardando>
                    <deal:InspecionadoElevador>${dto.inspecionado_elevador ?? '?'}</deal:InspecionadoElevador>
                    <deal:BloquearProduto>${dto.bloquear_produto ?? '?'}</deal:BloquearProduto>
                    <deal:CorPrisma_Codigo>${dto.prisma_codigo ?? '?'}</deal:CorPrisma_Codigo>
                    <deal:NroPrisma>${dto.nro_prisma ?? '?'}</deal:NroPrisma>
                    <deal:OSEntregaDomicilio>${dto.os_entrega_domicilio ?? '?'}</deal:OSEntregaDomicilio>
                    <deal:ObservacaoConsultor>${dto.observacao_consultor ?? '?'}</deal:ObservacaoConsultor>
                    <deal:TipoOSSigla>${dto.tipo_os_sigla ?? '?'}</deal:TipoOSSigla>
                    <deal:ExisteObjetoValor>${dto.existe_objeto_valor ?? '?'}</deal:ExisteObjetoValor>
                    <deal:CarregarBateria>${dto.carregar_bateria ?? '?'}</deal:CarregarBateria>
                    <deal:Acao>INC</deal:Acao>
                    ${services}
                    <deal:TipoOS>
                      ${os_tipos}
                    </deal:TipoOS>
                </deal:Sdt_fsordemservicoin>
            </deal:WS_FastServiceApi.ORDEMSERVICO>
       </soapenv:Body>
    </soapenv:Envelope>
        `;

    return xmlBody;
  }

  async updateOsXmlSchema(connection: IntegrationDealernet, dto: UpdateDealernetOsDTO): Promise<string> {
    const body = {
      ...dto,
      Servicos: {
        Servico: dto.Servicos?.map((servico) => {
          const Produtos = servico.Produtos?.map((produto) => produto);
          const Marcacoes = servico.Marcacoes?.map((marcacao) => marcacao);

          return {
            ...servico,
            Produtos: {
              Produto: Produtos
            },
            Marcacoes: {
              Marcacao: Marcacoes
            }
          }
        }),
      },
      TipoOS: {
        TipoOSItem: dto.TipoOS?.map((tipo) => tipo)
      }
    }

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${connection?.user}</deal:Usuario>
                    <deal:Senha>${connection?.key}</deal:Senha>
                  <deal:Sdt_fsordemservicoin>
                  <deal:EmpresaDocumento>${connection?.document}</deal:EmpresaDocumento>
                  <deal:Acao>ALT</deal:Acao>
                    ${parserJsonToXml(body)}
                </deal:Sdt_fsordemservicoin>
            </deal:WS_FastServiceApi.ORDEMSERVICO>
       </soapenv:Body>
    </soapenv:Envelope>
        `;

    return xmlBody;
  }

  async cancelXmlSchema(connection: IntegrationDealernet, dto: UpdateDealernetOsDTO): Promise<string> {
    const body = {
      ...dto,
      Servicos: {
        Servico: dto.Servicos.map((servico) => {
          const Produtos = servico.Produtos?.map((produto) => ({
            ...produto,
            Selecionado: produto.Selecionado ?? true
          }))

          return {
            ...servico,
            Selecionado: servico.Selecionado ?? true,
            Produtos: servico.Produtos ? { Produto: Produtos } : undefined
          }
        }),
      },
      TipoOS: undefined
    }

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${connection?.user}</deal:Usuario>
                    <deal:Senha>${connection?.key}</deal:Senha>
                  <deal:Sdt_fsordemservicoin>
                  <deal:EmpresaDocumento>${connection?.document}</deal:EmpresaDocumento>
                  <deal:Acao>CSP</deal:Acao>
                    ${parserJsonToXml(body)}
                </deal:Sdt_fsordemservicoin>
            </deal:WS_FastServiceApi.ORDEMSERVICO>
       </soapenv:Body>
    </soapenv:Envelope>
        `;

    return xmlBody;
  }

  async createOs(connection: IntegrationDealernet, dto: CreateDealernetOsDTO): Promise<DealernetOrderResponse> {
    Logger.log(`Criando OS Dealernet: ${JSON.stringify(dto)}`, 'DealernetOsService.createOs');

    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = await this.createOsXmlSchema(connection, dto);

    Logger.log(`XML: ${xmlBody}`, 'DealernetOsService.createOs');

    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody, { timeout: 60000 * 2 }).then((response) => new XMLParser().parse(response.data));
      const order: DealernetOrder = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista']['SDT_FSOrdemServicoOut'];

      if (order.Mensagem && order.Chave === 0) {
        Logger.error(JSON.stringify(order), 'DealernetOrderService.createOs');

        throw new BadRequestException(order.Mensagem, {
          cause: order,
          description: order.Mensagem
        });
      }

      return this.findByOsNumber(connection, order.NumeroOS);
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.createOs');
      throw new BadRequestException('Erro ao criar a OS', {
        cause: error,
        description: 'Ocorreu um erro ao abrir a Ordem de Serviço. Entre em contato com o suporte.'
      });
    }
  }

  async requestPartsXmlSchema(connection: IntegrationDealernet, dto: RequestPartOrderDTO): Promise<string> {
    const body = {
      Servicos:
      {
        Servico: dto.Servicos.map((servico) => ({
          ...servico,
          Produtos: {
            Produto: servico.Produtos.map((produto) => ({
              ...produto,
              Selecionado: true
            }))
          }
        }))
      }
    };

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
              <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${connection.user}</deal:Usuario>
                    <deal:Senha>${connection.key}</deal:Senha>
                  <deal:Sdt_fsordemservicoin>
                    <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
                    <deal:NumeroOS>${dto.NumeroOS}</deal:NumeroOS>
                    <deal:Chave>${dto.Chave}</deal:Chave>
                    <deal:Acao>REQ</deal:Acao>
                    ${parserJsonToXml(body)}
                  </deal:Sdt_fsordemservicoin>
              </deal:WS_FastServiceApi.ORDEMSERVICO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    return xmlBody;
  }

  async requestParts(connection: IntegrationDealernet, dto: RequestPartOrderDTO): Promise<DealernetOrderResponse> {
    const xmlBody = await this.requestPartsXmlSchema(connection, dto);
    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody).then((response) => new XMLParser().parse(response.data));
      const order: DealernetOrder = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista']['SDT_FSOrdemServicoOut'];

      if (order.Chave === 0 && order.Mensagem) {
        throw new BadRequestException(order.Mensagem);
      }

      return this.findByOsNumber(connection, order.NumeroOS);
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.createOs');
      throw error;
    }
  }

  async updateOs(connection: IntegrationDealernet, dto: UpdateDealernetOsDTO): Promise<DealernetOrderResponse> {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = await this.updateOsXmlSchema(connection, dto);
    try {

      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);
      const order: DealernetOrder =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista'][
        'SDT_FSOrdemServicoOut'
        ];

      if (order.Mensagem && order.Chave === 0) {
        throw new BadRequestException(order.Mensagem, {
          cause: order,
          description: order.Mensagem
        });
      }

      return this.findByOsNumber(connection, order.NumeroOS);
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.createOs');
      throw error;
    }
  }

  async cancelServiceOrProduct(connection: IntegrationDealernet, dto: UpdateDealernetOsDTO): Promise<DealernetOrderResponse> {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = await this.cancelXmlSchema(connection, dto);
    try {

      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);
      const order: DealernetOrder =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista'][
        'SDT_FSOrdemServicoOut'
        ];

      if (order.Mensagem && order.Chave === 0) {
        throw new BadRequestException(order.Mensagem, { description: order.Mensagem });
      }

      return this.findByOsNumber(connection, order.NumeroOS);
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.createOs');
      throw error;
    }
  }
}
