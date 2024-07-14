import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { formatarDoc } from 'src/commons';
import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { ProdutoUpdateDto } from 'src/dealernet/dto/update-os.dto';
import { TipoOSItemCreateDTO } from 'src/dealernet/order/dto/create-order.dto';
import { RequestPartOrderDTO } from 'src/dealernet/order/dto/request-part-order.dto';
import {
  UpdateDealernetMarcacaoDto,
  UpdateDealernetOsDTO,
  UpdateDealernetProductDTO,
  UpdateDealernetServiceDTO,
  UpdateDealernetTipoOSDto,
} from 'src/dealernet/order/dto/update-order.dto';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';
import { IntegrationDealernet, IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { OrderAppointmentEntity } from 'src/petroplay/order/entity/order-appointment.entity';
import { OrderBudgetEntity } from 'src/petroplay/order/entity/order-budget.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class OsService {
  constructor(
    private readonly context: ContextService,
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}

  async findByPPsOrderId(order_id: string, budget_id?: string): Promise<DealernetOrderResponse[]> {
    const order = await this.petroplay.order.findById(order_id, ['budgets']);
    if (!order) throw new NotFoundException(`Order '${order_id}' not found`);
    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');
    if (!order.integration_id) throw new HttpException(`Order '${order_id}' not sent to Dealernet`, 404);

    if (budget_id) {
      const budget = await this.petroplay.order.findOrderBudgets(order_id, budget_id);
      const filter = {
        os_number: budget[0].os_number,
      };
      return this.dealernet.order.find(integration.dealernet, filter);
    } else {
      const budget_numbers = order.budgets.map((budget) => budget.os_number);

      const result = [];
      await Promise.all(
        budget_numbers.map(async (number) => {
          const filter = {
            os_number: number,
          };
          const dealernetOrder = await this.dealernet.order.find(integration.dealernet, filter);
          result.push(...dealernetOrder);
        }),
      );

      return result;
    }
  }

  async createSchema(order_id: string, budget_id?: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    const budgets = await this.petroplay.order.findOrderBudgets(order.id, budget_id);

    const schemas = [];
    for await (const budget of budgets) {
      const dto = await this.osDtoToDealernetOs(order, budget, integration.dealernet);
      const schema = await this.dealernet.order.createOsXmlSchema(integration.dealernet, dto);
      schemas.push(schema);
    }

    return schemas.join('\n');
  }

  async createOs(order_id: string, budget_id?: string): Promise<DealernetOrderResponse[]> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budgets = await this.petroplay.order.findOrderBudgets(order.id, budget_id);

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const os = [];
    for await (const budget of budgets.filter((x) => !x.os_number)) {
      const schema = await this.osDtoToDealernetOs(order, budget, integration.dealernet);

      const response = await this.dealernet.order.createOs(integration.dealernet, schema).then(async (response) => {
        await this.petroplay.order.updateOrderBudget(order_id, budget.id, {
          os_number: response.NumeroOS?.toString(),
          integration_data: { ...budget.integration_data, os: response },
        });

        budget.os_number = response.NumeroOS?.toString();

        return response;
      });

      if (budget.is_request_products) {
        const dto = await this.requestPartsDto(integration, order_id, budget.id);

        await this.dealernet.order.requestParts(integration.dealernet, dto).catch((error) => {
          this.context.setWarning('Erro ao solicitar peças para a ordem');
          Logger.error(`Erro ao solicitar peças para a ordem ${order_id}`, error, 'OsService');
        });
      }

      os.push(response);
    }

    return os;
  }

  async osDtoToDealernetOs(
    order: PetroplayOrderEntity,
    budget: OrderBudgetEntity,
    connection: IntegrationDealernet,
  ): Promise<CreateOsDTO> {
    const tipo_os_sigla = order?.os_type?.external_id;
    const os_types: TipoOSItemCreateDTO[] = [];

    const users = await this.dealernet.customer.findUsers(connection, 'PRD');

    const services: ServicoCreateDTO[] = [];
    for await (const service of budget.services.filter((x) => x.is_approved)) {
      const os_type = service?.os_type ?? budget?.os_type ?? order?.os_type;
      if (!os_types?.find((x) => x.tipo_os_sigla == os_type.external_id)) {
        os_types.push({
          tipo_os_sigla: os_type.external_id,
          consultor_documento: formatarDoc(order.consultant?.cod_consultor),
        });
      }

      const document = service.mechanic?.cod_consultant ?? budget.mechanic?.cod_consultor ?? connection?.mechanic_document;

      const Produtivo = users.find((x) => x.Usuario_DocIdentificador == formatarDoc(document));

      services.push({
        tipo_os_sigla,
        tmo_referencia: service.integration_id,
        tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
        valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
        quantidade: Number(service.quantity) > 0 ? Math.ceil(service.quantity) : 1,
        produtivo_documento: budget.is_request_products ? formatarDoc(Produtivo.Usuario_DocIdentificador) : null,
        usuario_ind_responsavel: budget.is_request_products ? Produtivo.Usuario_Identificador : null,
        cobra: service?.is_charged_for ?? true,
        produtos: [],
      });
    }

    for await (const product of budget.products.filter((x) => x.is_approved)) {
      const os_type = product?.os_type ?? budget.os_type ?? order?.os_type;
      if (!os_types?.find((x) => x.tipo_os_sigla == os_type.external_id)) {
        os_types.push({
          tipo_os_sigla: os_type.external_id,
          consultor_documento: formatarDoc(order.consultant?.cod_consultor),
        });
      }

      const produtos = await this.dealernet.findProductByReference(connection, product.integration_id);
      const produto = produtos?.orderBy((x) => x.QuantidadeDisponivel, 'desc').first();

      if (!produto) {
        Logger.warn(`Produto ${product.integration_id}  ${product.name} não encontrado`, 'OsService');
        await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, product.product_id, {
          is_error: true,
          error_details: 'Produto não encontrado',
        });
      } else if (produto.QuantidadeDisponivel >= 0) {
        const dto = new ProdutoUpdateDto({
          produto: produto.ProdutoCodigo?.toString(),
          produto_referencia: produto.ProdutoReferencia,
          quantidade: product.quantity,
          valor_unitario: product.price,
          tipo_os_sigla: os_type.external_id,
          cobrar: product?.is_charged_for ?? true,
        });

        const service = services.find((x) => x.tmo_referencia == product.service_id && x.tipo_os_sigla == os_type.external_id);
        if (service) {
          service.produtos.push(dto);
        } else {
          services[0].produtos.push(dto);
        }
      } else {
        Logger.warn(`Produto ${product.integration_id}  ${product.name} sem quantidade disponível`, 'OsService');
        await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, product.product_id, {
          is_error: true,
          error_details: 'Produto sem quantidade disponível',
        });
      }
    }

    const cod_consultor = order.consultant?.cod_consultor ?? this.context.currentUser()?.cod_consultor;
    const OS: CreateOsDTO = {
      veiculo_placa_chassi: order.vehicle_chassis_number,
      veiculo_Km: Number(order.mileage) || 0,
      cliente_documento: order.customer_document,
      consultor_documento: formatarDoc(cod_consultor),
      data: new Date(order.inspection).toISOString(),
      data_final: new Date().toISOString(),
      data_prometida: new Date(order.conclusion).toISOString(),
      nro_prisma: order.prisma,
      observacao: order.notes,
      prisma_codigo: order.prisma,
      tipo_os_sigla: tipo_os_sigla,
      servicos: services,
      tipo_os_types: os_types,
    };
    return OS;
  }

  async requestPartsSchema(order_id: string, budget_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    const dto = await this.requestPartsDto(integration, order_id, budget_id);

    return this.dealernet.order.requestPartsXmlSchema(integration.dealernet, dto);
  }

  async requestPartsDto(integration: IntegrationResponse, order_id: string, budget_id: string): Promise<RequestPartOrderDTO> {
    const budget = await this.petroplay.order.findOrderBudgets(order_id, budget_id).then((budgets) => budgets?.first());

    if (budget?.os_number == null) throw new BadRequestException('OS number not found');

    const os = await this.dealernet.order.findByOsNumber(integration.dealernet, budget.os_number);

    const users = await this.dealernet.customer.findUsers(integration.dealernet, 'PRD');

    const Servicos = os.Servicos.map((item) => {
      const service = budget.services.find((x) => x.integration_id == item.TMOReferencia);
      const document =
        service.mechanic?.cod_consultant ?? budget.mechanic?.cod_consultor ?? integration.dealernet?.mechanic_document;

      const Produtivo = users.find((x) => x.Usuario_DocIdentificador == formatarDoc(document));
      return {
        Chave: item.Chave,
        ProdutivoDocumento: formatarDoc(Produtivo.Usuario_DocIdentificador),
        UsuarioIndResponsavel: Produtivo.Usuario_Identificador,
        Produtos: item.Produtos.map((product) => ({
          Chave: product.Chave,
          Selecionado: true,
        })),
      };
    });

    return { Chave: os.Chave, NumeroOS: os.NumeroOS, Servicos: Servicos };
  }

  async appointmentXmlSchema(order_id: string, budget_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    const budget = await this.petroplay.order.findOrderBudgets(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);

    return this.dealernet.order.updateOsXmlSchema(integration.dealernet, osDTO);
  }

  async appointment(order_id: string, budget_id: string): Promise<DealernetOrderResponse> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudgets(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);
    const os = await this.dealernet.order.updateOs(integration.dealernet, osDTO);

    for await (const { id } of appointments) {
      await this.petroplay.order.updateOrderAppointment(order.id, id, { was_sent_to_dms: true });
    }

    await this.petroplay.order.updateOrderBudget(order_id, budget_id, {
      integration_data: { ...budget.integration_data, os: os },
    });

    return os;
  }

  async osDtoAppointments(
    order: PetroplayOrderEntity,
    budget: OrderBudgetEntity,
    appointments: OrderAppointmentEntity[],
    connection: IntegrationDealernet,
  ): Promise<UpdateDealernetOsDTO> {
    const os = await this.dealernet.findOsByNumber(connection, budget.os_number);

    if (!os) throw new NotFoundException(`OS not found`);

    const appointmentsToSend = appointments.filter((x) => x.end_date && x.was_sent_to_dms == false && x.status == 'DONE');

    const Servicos: UpdateDealernetServiceDTO[] = [];
    for (const service of os.Servicos) {
      let usuario_ind_responsavel: string;
      let produtivo_documento: string;
      for await (const item of appointmentsToSend.filter((x) => x.integration_id == service.TMOReferencia)) {
        const user = await this.dealernet.customer.findUser(connection, item?.mechanic.cod_consultor);
        usuario_ind_responsavel = user.Usuario_Identificador;
        produtivo_documento = user.Usuario_DocIdentificador;

        const dateDiff = (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / 1000; // seconds
        service.Marcacoes.push({
          UsuarioDocumentoProdutivo: user.Usuario_Identificador,
          DataInicial: new Date(item.start_date).formatUTC('yyyy-MM-ddThh:mm:ss'),
          DataFinal: new Date(item.end_date).addMinutes(dateDiff <= 60 ? 1 : 0).formatUTC('yyyy-MM-ddThh:mm:ss'),
          MotivoParada: item?.reason_stopped?.external_id,
        });
      }

      const Produtos: UpdateDealernetProductDTO[] = service.Produtos.map((product) => ({
        Chave: product.Chave,
        TipoOSSigla: product.TipoOSSigla,
        Produto: product.Produto,
        ProdutoReferencia: product.ProdutoReferencia,
        ValorUnitario: product.ValorUnitario,
        Quantidade: product.Quantidade,
        Desconto: product.Desconto,
        DescontoPercentual: product.DescontoPercentual,
        KitCodigo: product.KitCodigo,
        CampanhaCodigo: product.CampanhaCodigo,
      }));

      const Marcacoes: UpdateDealernetMarcacaoDto[] = service.Marcacoes.map((mark) => ({
        Chave: mark.Chave,
        UsuarioDocumentoProdutivo: mark.UsuarioDocumentoProdutivo,
        DataInicial: mark.DataInicial,
        DataFinal: mark.DataFinal,
        MotivoParada: mark.MotivoParada,
        Observacao: mark.Observacao,
      }));

      Servicos.push({
        Chave: service.Chave,
        TipoOSSigla: service.TipoOSSigla,
        TMOReferencia: service.TMOReferencia,
        Tempo: service.Tempo,
        ValorUnitario: service.ValorUnitario,
        Quantidade: service.Quantidade,
        Desconto: service.Desconto,
        DescontoPercentual: service.DescontoPercentual,
        Observacao: service.Observacao,
        ProdutivoDocumento: formatarDoc(produtivo_documento),
        UsuarioIndResponsavel: usuario_ind_responsavel,
        Executar: service.Executar,
        Cobrar: service.Cobrar,
        DataPrevisao: service.DataPrevisao,
        KitCodigo: service.KitCodigo,
        KitPrecoFechado: service.KitPrecoFechado,
        CampanhaCodigo: service.CampanhaCodigo,
        Produtos: Produtos,
        Marcacoes: Marcacoes,
      });
    }

    const TipoOS: UpdateDealernetTipoOSDto[] = os.TipoOS.map((type) => ({
      TipoOSSigla: type.TipoOSSigla,
      ConsultorDocumento: formatarDoc(type.ConsultorDocumento),
      CondicaoPagamento: type.CondicaoPagamento,
    }));

    const dto: UpdateDealernetOsDTO = {
      Chave: os.Chave,
      NumeroOS: os.NumeroOS,
      VeiculoPlacaChassi: os.VeiculoPlaca,
      VeiculoKM: os.VeiculoKM,
      ClienteCodigo: os.ClienteCodigo,
      ClienteDocumento: formatarDoc(os.ClienteDocumento),
      ConsultorDocumento: formatarDoc(os.TipoOS.first().ConsultorDocumento),
      Data: os.Data,
      DataFinal: os.DataPrometida,
      Status: os.TipoOS.first().StatusAndamento,
      Observacao: os.Observacao,
      DataPrometida: os.DataPrometida,
      PercentualCombustivel: os.PercentualCombustivel,
      PercentualBateria: os.PercentualBateria,
      ExigeLavagem: os.ExigeLavagem,
      ClienteAguardando: os.ClienteAguardando,
      InspecionadoElevador: os.InspecionadoElevador,
      BloquearProduto: os.BloquearProduto,
      CorPrisma_Codigo: os.CorPrisma_Codigo,
      NroPrisma: os.NroPrisma,
      TipoOSSigla: order.os_type?.external_id ?? TipoOS?.first().TipoOSSigla,
      ExisteObjetoValor: os.ExisteObjetoValor,
      Servicos: Servicos,
      TipoOS: TipoOS,
    };
    return dto;
  }

  async formatDate(date?: Date, compare_date?: Date): Promise<string> {
    if (!date) {
      return '?';
    }

    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (compare_date) {
      compare_date = new Date(compare_date);
      minutes = compare_date.getMinutes() + 1;
    }

    if (minutes >= 60) {
      minutes -= 60;
      hours += 1;
    }

    if (hours >= 24) {
      hours -= 24;
      date.setDate(date.getDate() + 1);
    }

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}`;
  }
}
