/* eslint-disable prettier/prettier */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { OrderFilter } from 'src/modules/os/filters/order.filters';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { DealernetOrder, DealernetOrderResponse, Servico } from '../response/os-response';

import { CreateDealernetOsDTO } from './dto/create-order.dto';
import { UpdateOsDTO } from '../dto/update-os.dto';

@Injectable()
export class DealernetOsService {
  async findOS(connection: IntegrationDealernet, filter?: OrderFilter): Promise<DealernetOrderResponse[]> {
    Logger.log(`Buscando OS Dealernet`, 'OS');
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
      const client = await dealernet();

      const response = await client.post(url, xmlBody);
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const orders: DealernetOrder | DealernetOrder[] =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista'][
        'SDT_FSOrdemServicoOut'
        ];

      if (!isArray(orders)) {
        if (orders.Mensagem) {
          throw new BadRequestException(orders.Mensagem);
        }
        const refactored_service: Servico[] = []
        if(isArray(orders.Servicos.Servico)){
          orders.Servicos.Servico.map(service=>
            refactored_service.push(service)
          )
        }else{
          refactored_service.push(orders.Servicos.Servico)
        }
        return [{
          ...orders,
          Servicos: refactored_service
        }];
      }
      const refactored_orders: DealernetOrderResponse[] = []
      orders.map(order=>{
        const refactored_service: Servico[] = []

        if(isArray(order.Servicos.Servico)){
          order.Servicos.Servico.map(service=>
            refactored_service.push(service)
          )
        }else{
          refactored_service.push(order.Servicos.Servico)
        }
        refactored_orders.push({...order, Servicos: refactored_service})
      }
      )
      return  refactored_orders
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.findOS');
      throw error;
    }
  }

  async createOsXmlSchema(connection: IntegrationDealernet, dto: CreateDealernetOsDTO): Promise<string> {
    Logger.log(`Criando Schema OS Dealernet`, 'DealernetOsService.createOsXmlSchema');
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

        const os_types =
        dto.tipo_os_array.length>0?
        `
        <deal:TipoOS>
        ${dto.tipo_os_array.map(tipo_os=>{
          return`
          <deal:TipoOSItem>
            <deal:TipoOSSigla>${tipo_os?? '?'}</deal:TipoOSSigla>
            <deal:ConsultorDocumento>${dto.tipo_os.tipo_os_item.consultor_documento ?? '?'}</deal:ConsultorDocumento>
            <deal:CondicaoPagamento>${dto.tipo_os.tipo_os_item.condicao_pagamento ?? '?'}</deal:CondicaoPagamento>
          </deal:TipoOSItem>`
        }).join('\n')}
        </deal:TipoOS>
        `
        :
        `
        <deal:TipoOS>
          <deal:TipoOSItem>
            <deal:TipoOSSigla>${dto.tipo_os.tipo_os_item.tipo_os_sigla ?? '?'}</deal:TipoOSSigla>
            <deal:ConsultorDocumento>${dto.tipo_os.tipo_os_item.consultor_documento ?? '?'}</deal:ConsultorDocumento>
            <deal:CondicaoPagamento>${dto.tipo_os.tipo_os_item.condicao_pagamento ?? '?'}</deal:CondicaoPagamento>
          </deal:TipoOSItem>
        </deal:TipoOS>
        `
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
                    ${os_types}
                </deal:Sdt_fsordemservicoin>
            </deal:WS_FastServiceApi.ORDEMSERVICO>
       </soapenv:Body>
    </soapenv:Envelope>
        `;

    return xmlBody;
  }
  async updateOsXmlSchema(connection: IntegrationDealernet, dto: UpdateOsDTO): Promise<string> {
    Logger.log(`Criando Schema OS Dealernet`, 'OS');
    const services =
      dto.servicos?.length > 0
        ? `
        <deal:Servicos>
          ${dto.servicos
            .map((item) => {
              const products =
                item.produtos?.length > 0
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
              const appointments =
                  item.marcacoes?.length > 0
                  ?`
                  <deal:Marcacoes>
              ${item.marcacoes
                .map((marcacao) => {
                  return `
                <deal:Marcacao>
                  <deal:UsuarioDocumentoProdutivo>${marcacao.usuario_documento_produtivo}</deal:UsuarioDocumentoProdutivo>
                  <deal:DataInicial>${marcacao.data_inicial}</deal:DataInicial>
                  <deal:DataFinal>${marcacao.data_final}</deal:DataFinal>
                  <deal:MotivoParada>1</deal:MotivoParada>
                  <deal:Observacao>${marcacao.observacao}</deal:Observacao>
                </deal:Marcacao>
                  `;
                })
                .join('\n')}
            </deal:Marcacoes>
            `
            : '';
              return `
            <deal:Servico>
              <deal:Chave>${item.chave}</deal:Chave>
              <deal:TipoOSSigla>${item.tipo_os_sigla}</deal:TipoOSSigla>
              <deal:TMOReferencia>${item.tmo_referencia}</deal:TMOReferencia>
              <deal:Tempo>${item.tempo}</deal:Tempo>
              <deal:ValorUnitario>${item.valor_unitario}</deal:ValorUnitario>
              <deal:Quantidade>${item.quantidade}</deal:Quantidade>
              ${item.usuario_ind_responsavel? `<deal:UsuarioIndResponsavel>${item.usuario_ind_responsavel}</deal:UsuarioIndResponsavel>` : ''}
              ${item.produtivo_documento? `<deal:ProdutivoDocumento>${item.produtivo_documento}</deal:ProdutivoDocumento>`:''}
              ${products}
              ${appointments}
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
              <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${connection?.user}</deal:Usuario>
                    <deal:Senha>${connection?.key}</deal:Senha>
                  <deal:Sdt_fsordemservicoin>
                    <deal:Chave>${dto.chave}</deal:Chave>
                    <deal:EmpresaDocumento>${connection?.document}</deal:EmpresaDocumento>
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
                    <deal:Acao>ALT</deal:Acao>
                    ${services}
                    <deal:TipoOS>
                        <deal:TipoOSItem>
                            <deal:TipoOSSigla>${dto.tipo_os.tipo_os_item.tipo_os_sigla ?? '?'}</deal:TipoOSSigla>
                            <deal:ConsultorDocumento>${dto.tipo_os.tipo_os_item.consultor_documento ?? '?'}</deal:ConsultorDocumento>
                            <deal:CondicaoPagamento>${dto.tipo_os.tipo_os_item.condicao_pagamento ?? '?'}</deal:CondicaoPagamento>
                        </deal:TipoOSItem>
                    </deal:TipoOS>
                </deal:Sdt_fsordemservicoin>
            </deal:WS_FastServiceApi.ORDEMSERVICO>
       </soapenv:Body>
    </soapenv:Envelope>
        `;

    return xmlBody;
  }
  async createOs(connection: IntegrationDealernet, dto: CreateDealernetOsDTO): Promise<DealernetOrderResponse> {
    Logger.log(`Criando OS Dealernet`, 'DealernetOsService.createOs');
    const url = `${connection.url}/aws_fastserviceapi.aspx`;
    const xmlBody = await this.createOsXmlSchema(connection, dto);

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
        throw new BadRequestException(order.Mensagem);
      }

      const refactored_service: Servico[] = []
      if(isArray(order.Servicos.Servico)){
        order.Servicos.Servico.map(service=>
          refactored_service.push(service)
        )
      }else{
        refactored_service.push(order.Servicos.Servico)
      }
      const responseOrder : DealernetOrderResponse ={
        ...order,
        Servicos: refactored_service,
      }
      return responseOrder;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.createOs');
      throw error;
    }
  }
  async updateOs(connection: IntegrationDealernet, dto: UpdateOsDTO): Promise<DealernetOrderResponse> {
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
        throw new BadRequestException(order.Mensagem);
      }
      const refactored_service: Servico[] = []
      if(isArray(order.Servicos.Servico)){
        order.Servicos.Servico.map(service=>
          refactored_service.push(service)
        )
      }else{
        refactored_service.push(order.Servicos.Servico)
      }
      const responseOrder : DealernetOrderResponse ={
        ...order,
        Servicos:  refactored_service,
      }
      return responseOrder;
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealernetOrderService.createOs');
      throw error;
    }
  }
}
