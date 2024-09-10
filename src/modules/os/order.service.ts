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
  UpdateDealernetServiceDTO,
  UpdateDealernetServiceProductDTO,
  UpdateDealernetTipoOSDto,
} from 'src/dealernet/order/dto/update-order.dto';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';
import { IntegrationDealernet, IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { OrderAppointmentEntity } from 'src/petroplay/order/entity/order-appointment.entity';
import { OrderBudgetEntity } from 'src/petroplay/order/entity/order-budget.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { AttachServiceToOrderDTO } from './dto/attach-service-to-order.dto';

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
      const budget_numbers = order.budgets.filter((x) => x.os_number).map((budget) => budget.os_number);

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
    for await (const [index, budget] of budgets.entries()) {
      order.inspection = new Date(order.inspection).addMinutes(+index);
      order.conclusion = new Date(order.conclusion).addMinutes(+index);
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
    for await (const [index, budget] of budgets.entries()) {
      order.inspection = new Date(order.inspection).addMinutes(+index);
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
    const os_types: TipoOSItemCreateDTO[] = [];

    const users = await this.dealernet.customer.findUsers(connection, 'PRD');

    const services: ServicoCreateDTO[] = [];
    for await (const service of budget.services.filter((x) => x.is_approved)) {
      const os_type = service?.os_type ?? budget?.os_type ?? order?.os_type;
      if (!os_type)
        throw new BadRequestException('OS type not found', {
          description: `Não foi definido o tipo de OS para o serviço ${service.service_id} | ${service.name}`,
        });

      if (!os_types?.find((x) => x.tipo_os_sigla == os_type.external_id)) {
        os_types.push({
          tipo_os_sigla: os_type.external_id,
          consultor_documento: formatarDoc(order.consultant?.cod_consultor),
        });
      }

      const document = service.mechanic?.cod_consultant ?? budget.mechanic?.cod_consultor ?? connection?.mechanic_document;

      const Produtivo = users.find((x) => x.Usuario_DocIdentificador == formatarDoc(document));

      if (budget.is_request_products && (!Produtivo || !Produtivo.Usuario_Identificador)) {
        Logger.warn(`Mecânico ${document} não encontrado`, 'OsService');
        throw new BadRequestException(`Mecânico ${document} não encontrado`, {
          description: `Mecânico com documento ${document} não encontrado`,
        });
      }

      services.push({
        tipo_os_sigla: os_type.external_id,
        service_id: service.service_id,
        tmo_referencia: service.integration_id,
        tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
        valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
        quantidade: 1,
        produtivo_documento: budget.is_request_products ? formatarDoc(Produtivo.Usuario_DocIdentificador) : null,
        usuario_ind_responsavel: budget.is_request_products ? Produtivo.Usuario_Identificador : null,
        cobra: service?.is_charged_for ?? true,
        setor_execucao: connection.execution_sector,
        observacao: service.notes,
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

      if (!produto || produto.ProdutoCodigo == 0) {
        Logger.warn(`Produto ${product.integration_id}  ${product.name} não encontrado`, 'OsService');
        await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, product.product_id, {
          is_error: true,
          error_details: 'Produto não encontrado',
        });
      } else {
        const dto = new ProdutoUpdateDto({
          produto: produto.ProdutoCodigo?.toString(),
          produto_referencia: produto.ProdutoReferencia,
          quantidade: product.quantity,
          valor_unitario: product.price,
          tipo_os_sigla: os_type.external_id,
        });

        const service = services.find((x) => x.service_id == product.service_id && x.tipo_os_sigla == os_type.external_id);
        if (service) {
          service.produtos.push(dto);
        } else {
          services[0].produtos.push(dto);
        }
      }
    }

    const cod_consultor = order.consultant?.cod_consultor ?? this.context.currentUser()?.cod_consultor;
    const OS: CreateOsDTO = {
      veiculo_placa_chassi: order.vehicle_chassis_number,
      veiculo_Km: Number(order.mileage) || 0,
      cliente_documento: order.customer_document,
      consultor_documento: formatarDoc(cod_consultor),
      data: new Date(order.inspection).toISOString(),
      data_final: new Date(order.conclusion).toISOString(),
      data_prometida: new Date(order.conclusion).toISOString(),
      nro_prisma: order.prisma,
      observacao: order.notes,
      prisma_codigo: order.prisma,
      tipo_os_sigla: order?.os_type?.external_id ?? services?.first()?.tipo_os_sigla ?? order.os_type?.external_id,
      servicos: services,
      tipo_os_types: os_types,
    };
    return OS;
  }

  async requestPartsSchema(order_id: string, budget_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    Logger.log(`Rota RequestParts: Montando solicitação de peças para a ordem ${order_id}`, 'OsService');

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

  async appointment(order_id: string, budget_id: string, appointment_id: string): Promise<DealernetOrderResponse> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudgets(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id, [appointment_id]);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);
    const os = await this.dealernet.order
      .updateOs(integration.dealernet, osDTO)
      .then(async (response) => {
        await this.petroplay.order.updateOrderAppointment(order.id, appointment_id, {
          was_sent_to_dms: true,
        });

        return response;
      })
      .catch(async (error) => {
        await this.petroplay.order.updateOrderAppointment(order.id, appointment_id, {
          is_error_sent_to_dms: true,
          error_sent_to_dms_details: error?.message ?? 'Erro ao enviar apontamento para o DMS',
        });

        this.context.setWarning('Erro ao adicionar apontamento na Ordem de Serviço');
        Logger.error(`Erro ao atualizar apontamento da ordem ${order_id}`, error, 'OsService');
        throw new BadRequestException('Erro ao atualizar apontamento da ordem');
      });

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

    const users = await this.dealernet.customer.findUsers(connection, 'PRD');

    const Servicos: UpdateDealernetServiceDTO[] = [];
    for (const service of os.Servicos) {
      const user = users.filter((x) => x.Usuario_Identificador == service.UsuarioIndResponsavel).first();
      let usuario_ind_responsavel = user?.Usuario_Identificador;
      let produtivo_documento = user?.Usuario_DocIdentificador;

      const Marcacoes: UpdateDealernetMarcacaoDto[] = [];
      for await (const item of appointmentsToSend.filter((x) => x.integration_id == service.TMOReferencia)) {
        const user = await this.dealernet.customer.findUser(connection, item?.mechanic.cod_consultor);
        usuario_ind_responsavel = user.Usuario_Identificador;
        produtivo_documento = user.Usuario_DocIdentificador;

        const dateDiff = (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / 1000; // seconds
        const DataInicial = new Date(item.start_date).addMinutes(-1);
        const DataFinal = new Date(item.end_date).addMinutes(-1).addMinutes(dateDiff <= 60 ? 1 : 0);
        Marcacoes.push({
          UsuarioDocumentoProdutivo: user.Usuario_Identificador,
          DataInicial: DataInicial.formatUTC('yyyy-MM-ddThh:mm:ss'),
          DataFinal: DataFinal.formatUTC('yyyy-MM-ddThh:mm:ss'),
          MotivoParada: item?.reason_stopped?.external_id,
          Observacao: item?.reason_stopped?.name,
        });
      }

      if (Marcacoes.length > 0) {
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
          SetorExecucao: connection.execution_sector,
          Marcacoes: Marcacoes.map((mark) => ({
            ...mark,
            UsuarioDocumentoProdutivo: formatarDoc(mark.UsuarioDocumentoProdutivo),
          })),
        });
      }
    }

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
      TipoOSSigla: os.Servicos.first().TipoOSSigla,
      ExisteObjetoValor: os.ExisteObjetoValor,
      Servicos: Servicos,
    };
    return dto;
  }

  async attachServiceToOrderSchema(order_id: string, budget_id: string, attachDTO: AttachServiceToOrderDTO): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudgets(order.id, budget_id).then((budgets) => budgets?.first());
    const osDTO = await this.osAttachServicesToOrder(order, budget, attachDTO, integration.dealernet);

    return this.dealernet.order.updateOsXmlSchema(integration.dealernet, osDTO);
  }

  async attachServiceToOrder(
    order_id: string,
    budget_id: string,
    attachDTO: AttachServiceToOrderDTO,
  ): Promise<DealernetOrderResponse> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudgets(order.id, budget_id).then((budgets) => budgets?.first());
    const osDTO = await this.osAttachServicesToOrder(order, budget, attachDTO, integration.dealernet);

    const os = await this.dealernet.order
      .updateOs(integration.dealernet, osDTO)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        this.context.setWarning('Erro ao adicionar serviço a Ordem de Serviço');
        Logger.error(
          `Erro ao adicionar serviço ${attachDTO.service_id} de tipo: ${attachDTO.os_type_id} da ordem ${order_id}`,
          error,
          'OsService',
        );
        throw new BadRequestException('Erro ao adicionar serviço a ordem', {
          description: error?.message ?? 'Não foi possível adicionar o serviço a ordem',
        });
      });

    return os;
  }

  async osAttachServicesToOrder(
    order: PetroplayOrderEntity,
    budget: OrderBudgetEntity,
    attachDTO: AttachServiceToOrderDTO,
    connection: IntegrationDealernet,
  ): Promise<UpdateDealernetOsDTO> {
    const os = await this.dealernet.findOsByNumber(connection, budget.os_number);
    if (!os) throw new NotFoundException(`OS not found`);

    const users = await this.dealernet.customer.findUsers(connection, 'PRD');
    const filters_services = budget.services?.filter(
      (service) => service.service_id === attachDTO.service_id && attachDTO.os_type_id,
    );

    const filter_products = budget.products?.filter(
      (product) => product.service_id === attachDTO.service_id && attachDTO.os_type_id,
    );

    const TipoOS: UpdateDealernetTipoOSDto[] = [];
    const Servicos: UpdateDealernetServiceDTO[] = [];

    for (const service of filters_services) {
      const os_type = service?.os_type ?? budget?.os_type ?? order?.os_type;
      if (!os_type)
        throw new BadRequestException('OS type not found', {
          description: `Não foi definido o tipo de OS para o serviço ${service.service_id} | ${service.name}`,
        });

      if (!TipoOS?.find((x) => x.TipoOSSigla == os_type.external_id)) {
        TipoOS.push({
          TipoOSSigla: os_type.external_id,
          ConsultorDocumento: formatarDoc(order.consultant?.cod_consultor),
        });
      }

      const Documento = service.mechanic?.cod_consultant ?? budget.mechanic?.cod_consultor ?? connection?.mechanic_document;
      const Produtivo = users.find((x) => x.Usuario_DocIdentificador == formatarDoc(Documento));

      const Produtos: UpdateDealernetServiceProductDTO[] = [];

      for await (const product of filter_products) {
        const produtos = await this.dealernet.findProductByReference(connection, product.integration_id);
        const produto = produtos?.orderBy((x) => x.QuantidadeDisponivel, 'desc').first();

        if (!produto || produto.ProdutoCodigo == 0) {
          Logger.warn(`Produto ${product.integration_id}  ${product.name} não encontrado`, 'OsService');
          await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, product.product_id, {
            is_error: true,
            error_details: 'Produto não encontrado',
          });
        } else if (produto.QuantidadeDisponivel >= 0) {
          Produtos.push({
            TipoOSSigla: os_type.external_id,
            ProdutoReferencia: produto.ProdutoReferencia,
            Quantidade: product.quantity,
            ValorUnitario: product.price,
          });
        } else {
          Logger.warn(`Produto ${product.integration_id}  ${product.name} sem quantidade disponível`, 'OsService');
          await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, product.product_id, {
            is_error: true,
            error_details: 'Produto sem quantidade disponível',
          });
        }
      }

      Servicos.push({
        TipoOSSigla: os_type.external_id,
        TMOReferencia: service.integration_id,
        Tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
        ValorUnitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
        Quantidade: 1,
        ProdutivoDocumento: budget.is_request_products ? formatarDoc(Produtivo.Usuario_DocIdentificador) : null,
        UsuarioIndResponsavel: budget.is_request_products ? Produtivo.Usuario_Identificador : null,
        Cobrar: service?.is_charged_for ?? true,
        SetorExecucao: connection?.execution_sector,
        Observacao: service.notes,
        Produtos: Produtos,
      });
    }

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
      TipoOSSigla: os.Servicos.first().TipoOSSigla,
      ExisteObjetoValor: os.ExisteObjetoValor,
      Servicos: Servicos,
      TipoOS: TipoOS,
    };
    return dto;
  }
}
