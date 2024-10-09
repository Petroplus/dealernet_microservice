import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { formatarDoc } from 'src/commons';
import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { ProdutoUpdateDto } from 'src/dealernet/dto/update-os.dto';
import { TipoOSItemCreateDTO } from 'src/dealernet/order/dto/create-order.dto';
import { UpdateDealernetOsDTO, UpdateDealernetServiceDTO } from 'src/dealernet/order/dto/update-order.dto';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';
import { UpsertOrderBudgetServiceDto } from 'src/petroplay/order/dto/upsert-order-budget-service.dto';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { OrderBudgetEntity } from 'src/petroplay/order/entity/order-budget.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { EditDealernetServiceDTO } from '../os/dto/edit-dealernet-service.dto';
import { OsService } from '../os/order.service';
import { ServiceFilter } from '../service/filters/service.filter';

import { CancelServiceDTO } from './dto/cancel-service.dto';

@Injectable()
export class BudgetService {
  constructor(
    private readonly context: ContextService,
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
    private readonly osService: OsService,
  ) {}

  async find(order_id: string, budget_id: string): Promise<DealernetBudgetResponse> {
    const order = await this.petroplay.order.findById(order_id);
    if (!order) throw new BadRequestException('Order not found');

    const budget = await this.petroplay.order.findOrderBudgets(order_id, budget_id).then((budgets) => budgets?.first());
    if (!budget) throw new BadRequestException('Budget not found');

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    return this.dealernet.budget.findByBudgetNumber(integration.dealernet, budget.budget_number);
  }

  async createSchema(order_id: string, budget_id?: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    const budgets = await this.petroplay.order.findOrderBudgets(order.id, budget_id);

    const schemas = [];
    for await (const budget of budgets) {
      const osDTO = await this.osDtoToDealernetOs(order, budget, integration.dealernet);
      const schema = await this.dealernet.budget.createXmlSchema(integration.dealernet, osDTO as any);
      schemas.push(schema);
    }

    return schemas.join('\n');
  }

  async create(order_id: string, budget_id?: string): Promise<DealernetBudgetResponse[]> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budgets = order.budgets.filter((x) => x.id === budget_id || !budget_id);

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const os = [];
    for await (const budget of budgets.filter((x) => !x.budget_number)) {
      const schema = await this.createSchema(order_id, budget.id);

      await this.dealernet.budget.create(integration.dealernet, schema).then(async (response) => {
        await this.petroplay.order.updateOrderBudget(order_id, budget.id, { budget_number: response.Chave?.toString() });
        os.push(response);
      });
    }

    return os;
  }

  async osDtoToDealernetOs(
    order: PetroplayOrderEntity,
    budget: OrderBudgetEntity,
    connection: IntegrationDealernet,
  ): Promise<CreateOsDTO> {
    const os_types: TipoOSItemCreateDTO[] = [];

    const services: ServicoCreateDTO[] = [];
    for await (const service of budget.services) {
      const os_type = service?.os_type ?? budget?.os_type ?? order?.os_type;
      if (!os_type)
        throw new BadRequestException('OS type not found', {
          description: `Não foi definido o tipo de OS para o serviço ${service.service_id} | ${service.name}`,
        });

      if (!os_types?.find((x) => x.tipo_os_sigla == os_type.external_id)) {
        os_types.push({
          tipo_os_sigla: os_type.external_id,
          consultor_documento: await this.formatarDoc(order.consultant?.cod_consultor),
        });
      }

      services.push({
        service_id: service.service_id,
        tipo_os_sigla: os_type.external_id,
        tmo_referencia: service.integration_id,
        tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
        valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
        quantidade: 1,
        cobra: service?.is_charged_for ?? true,
        executar: service?.is_approved ?? true,
        observacao: service.notes,
        produtos: [],
      });
    }

    for await (const product of budget.products) {
      const os_type = product?.os_type ?? budget.os_type ?? order?.os_type;
      if (!os_types?.find((x) => x.tipo_os_sigla == os_type.external_id)) {
        os_types.push({
          tipo_os_sigla: os_type.external_id,
          consultor_documento: await this.formatarDoc(order.consultant?.cod_consultor),
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
        });

        const service = services.find((x) => x.service_id == product.service_id && x.tipo_os_sigla == os_type.external_id);
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
      consultor_documento: await this.formatarDoc(cod_consultor),
      data: new Date(order.inspection).toISOString(),
      data_final: new Date().toISOString(),
      data_prometida: new Date(order.conclusion).toISOString(),
      dias_prazo_entrega: Math.ceil(new Date(order.conclusion).diffInDays(new Date(order.inspection))),
      nro_prisma: order.prisma,
      observacao: order.notes,
      prisma_codigo: order.prisma,
      tipo_os_sigla: order?.os_type?.external_id ?? os_types?.first()?.tipo_os_sigla,
      servicos: services,
      tipo_os_types: os_types,
    };
    return OS;
  }

  async formatarDoc(doc?: string): Promise<string> {
    if (!doc) return '?';
    if (doc?.length === 11) return doc;
    else {
      const totalZeros = 11 - doc?.length;
      let result = '';

      for (let i = 0; i < totalZeros; i++) {
        result += '0';
      }

      result += doc;

      return result;
    }
  }
}
