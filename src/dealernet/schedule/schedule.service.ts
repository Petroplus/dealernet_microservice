/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { dealernet } from 'src/commons/web-client';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';

import { UpsertScheduleDto } from './dto/upsert-schedule';
import { ScheduleFilter } from './filters/schedule.filter';
import { DealernetSchedule } from './response/schedule-response';

@Injectable()
export class DealernetScheduleService {
  async upsert(connection: IntegrationDealernet, schedule: UpsertScheduleDto): Promise<DealernetSchedule> {
    const url = `${connection.url}/aws_fastserviceapi.aspx`;


    const services = () => {
      const Servicos = schedule.Servicos ?? [];
      if (Servicos.length == 0) return '';

      const products = (Produtos = []) => {
        if (Produtos?.length == 0) return '';

        return Produtos.map((item) => `
        <deal:Produto>
          <deal:TipoOSSigla>${item.TipoOSSigla}</deal:TipoOSSigla>
          <deal:ProdutoReferencia>${item.ProdutoReferencia}</deal:ProdutoReferencia>
          <deal:ValorUnitario>${item.ValorUnitario}</deal:ValorUnitario>
          <deal:Quantidade>${item.Quantidade}</deal:Quantidade>
        </deal:Produto>
      `).join('\n');
      };

      return Servicos.map((item) => `
        <deal:Servico>
          <deal:TipoOSSigla>${item.TipoOSSigla}</deal:TipoOSSigla>
          <deal:TMOReferencia>${item.TMOReferencia}</deal:TMOReferencia>
          <deal:Tempo>${item.Tempo}</deal:Tempo>
          <deal:ValorUnitario>${item.ValorUnitario}</deal:ValorUnitario>
          <deal:Quantidade>${item.Quantidade}</deal:Quantidade>
          <deal:Produtos>
            ${products(item.Produtos)}
          </deal:Produtos>
        </deal:Servico>
      `).join('\n');
    }


    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.AGENDAMENTO>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsagendamentoin>
                    <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
                    <deal:Chave>${schedule?.Chave ?? '?'}</deal:Chave>
                    <deal:VeiculoPlacaChassi>${schedule?.VeiculoChassi ?? schedule?.VeiculoPlaca ?? '?'}</deal:VeiculoPlacaChassi>
                    <deal:VeiculoKM>${schedule?.VeiculoKM ?? '?'}</deal:VeiculoKM>
                    <deal:ClienteNome>${schedule?.ClienteNome ?? '?'}</deal:ClienteNome>
                    <deal:ClienteDocumento>${schedule?.ClienteDocumento ?? '?'}</deal:ClienteDocumento>
                    <deal:ConsultorDocumento>${schedule?.ConsultorDocumento ?? '?'}</deal:ConsultorDocumento>
                    <deal:TipoOSSigla>${schedule?.TipoOSSigla ?? '?'}</deal:TipoOSSigla>
                    <deal:Data>${schedule?.DataInicial ?? schedule?.Data ?? '?'}</deal:Data>
                    <deal:DataFinal>${schedule?.DataFinal ?? '?'}</deal:DataFinal>
                    <deal:Observacao>${schedule?.Observacao ?? '?'}</deal:Observacao>
                    <deal:Servicos>
                        ${services()}
                    </deal:Servicos>
                    <deal:Acao>${schedule?.Chave ? 'ALT' : 'INC'}</deal:Acao>
                </deal:Sdt_fsagendamentoin>
                </deal:WS_FastServiceApi.AGENDAMENTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    console.log(xmlBody);

    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody).then(({ data }) => new XMLParser().parse(data));
      const parsedData = response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.AGENDAMENTOResponse']['Sdt_fsagendamentooutlista']['SDT_FSAgendamentoOut'];

      if (parsedData.Chave == '0') {
        throw new BadRequestException("Erro ao criar/alterar agendamento", { description: parsedData?.Mensagem });
      }

      return parsedData;
    }
    catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealerNetScheduleService.create');
      throw error;
    }
  }

  async find(connection: IntegrationDealernet, filter: ScheduleFilter): Promise<DealernetSchedule[]> {
    const dataInicio = filter?.start_date?.formatUTC('yyyy-MM-dd') ?? new Date().addDays(0).format('yyyy-MM-dd');
    const dataFim = filter?.end_date?.formatUTC('yyyy-MM-dd') ?? new Date().addDays(0).format('yyyy-MM-dd');

    const url = `${connection.url}/aws_fastserviceapi.aspx`;

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.AGENDAMENTO>
                <deal:Usuario>${connection.user}</deal:Usuario>
                <deal:Senha>${connection.key}</deal:Senha>
                <deal:Sdt_fsagendamentoin>
                    <deal:EmpresaDocumento>${connection.document}</deal:EmpresaDocumento>
                    <deal:Chave>${filter?.schedule_id ?? '?'}</deal:Chave>
                    <deal:ClienteDocumento>${filter?.document ?? '?'}</deal:ClienteDocumento>
                    <deal:Data>${dataInicio}</deal:Data>
                    <deal:DataFinal>${dataFim}</deal:DataFinal>
                    <deal:Acao>LST</deal:Acao>
                </deal:Sdt_fsagendamentoin>
                </deal:WS_FastServiceApi.AGENDAMENTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    try {
      const client = await dealernet();

      const response = await client.post(url, xmlBody).then(({ data }) =>
        new XMLParser().parse(data)['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.AGENDAMENTOResponse']['Sdt_fsagendamentooutlista']['SDT_FSAgendamentoOut']);
      const agendamentos = Array.isArray(response) ? response : [response];

      if (agendamentos.filter((agendamento) => agendamento?.Mensagem).length > 0) return [];

      return agendamentos.map((x) => {
        const services = (isArray(x?.Servicos?.Servico) ? x.Servicos?.Servico : x.Servicos?.Servico && [x.Servicos?.Servico]);

        const Servicos = services?.map((item: any) => ({
          ...item,
          Produtos: isArray(item?.Produtos?.Produto) ? item.Produtos?.Produto : item.Produtos?.Produto && [item.Produtos?.Produto],
        }));
        const Cliente_DocIdentificador = x?.ClienteDocumento.toString();
        const Cliente_TipoPessoa = Cliente_DocIdentificador.length <= 11 ? 'F' : 'J';

        const document = Cliente_TipoPessoa == 'F' ? Cliente_DocIdentificador.padStart(11, '0') : Cliente_DocIdentificador.padStart(14, '0');
        return {
          ...x,
          ClienteDocumento: document,
          Servicos: Servicos
        };
      });
    } catch (error) {
      Logger.error('Erro ao fazer a requisição:', error, 'DealerNetScheduleService.find');
      throw error;
    }
  }
}
