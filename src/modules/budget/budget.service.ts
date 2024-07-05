import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { CreateDealernetBudgetDTO } from 'src/dealernet/budget/dto/create-budget.dto';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ProdutoCreateDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { OrderBudgetEntity } from 'src/petroplay/order/entity/order-budget.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class BudgetService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}

  async find(order_id: string, integration_id: string): Promise<DealernetBudgetResponse> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dealernet.budget.find(integration.dealernet, integration_id);
  }

  async createSchema(order_id: string, budget_id?: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    const budgets = await this.petroplay.order.findOrderBudget(order.id, budget_id);

    const osDTO = await this.osDtoToDealernetOs(order, budgets);

    return this.dealernet.budget.createXmlSchema(integration.dealernet, osDTO as any);
  }

  async create(order_id: string, dto: CreateDealernetBudgetDTO): Promise<DealernetBudgetResponse> {
    const integration = await this.petroplay.integration.findByClientId(order_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dealernet.budget.create(integration.dealernet, dto);
  }

  async osDtoToDealernetOs(order: PetroplayOrderEntity, budgets: OrderBudgetEntity[]): Promise<CreateOsDTO> {
    const services: ServicoCreateDTO[] = [];
    const products_hashtable = {};

    let aux_os_type = order?.os_type?.external_id;
    budgets.map((budget) => {
      if (!aux_os_type) {
        aux_os_type = budget?.os_type?.external_id;
      }

      let already_used_os_type_products = false;

      budget.products.map((product) => {
        if (!aux_os_type) {
          aux_os_type = product?.os_type?.external_id;
        }
        const tipo_os_sigla = product?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
        const productEntry = {
          tipo_os_sigla,
          produto_referencia: product.integration_id,
          valor_unitario: Number(product.price) > 0 ? Number(product.price) : 0.01,
          quantidade: Number(product.quantity) > 0 ? Number(product.quantity) : 1,
        };

        if (product.service_id) {
          products_hashtable[product.service_id] = [...(products_hashtable[product.service_id] || []), productEntry];
        } else {
          products_hashtable[aux_os_type] = [...(products_hashtable[aux_os_type] || []), productEntry];
        }
      });

      budget.services.map((service, index) => {
        if (!aux_os_type) {
          aux_os_type = service?.os_type?.external_id;
        }
        const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
        let produtos = [];

        if (products_hashtable[service.service_id]) {
          produtos = [...products_hashtable[service.service_id]];
        } else if (products_hashtable[aux_os_type] && !already_used_os_type_products) {
          produtos = [...products_hashtable[aux_os_type]];
          already_used_os_type_products = true;
        }
        services.push({
          tipo_os_sigla,
          tmo_referencia: service.integration_id,
          tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
          valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
          quantidade: Number(service.quantity) > 0 ? Math.ceil(service.quantity) : 1,
          produtos,
        });
      });
    });

    const OS: CreateOsDTO = {
      veiculo_placa_chassi: order.vehicle_chassis_number,
      veiculo_Km: Number(order.mileage) || 0,
      cliente_documento: order.customer_document,
      consultor_documento: await this.formatarDoc(order.consultant?.cod_consultor),
      data: new Date(order.inspection).toISOString(),
      data_final: new Date().toISOString(),
      data_prometida: new Date(order.conclusion).toISOString(),
      dias_prazo_entrega: Math.ceil(new Date(order.conclusion).diffInDays(new Date(order.inspection))),
      nro_prisma: order.prisma,
      observacao: order.notes,
      prisma_codigo: order.prisma,
      tipo_os_sigla: aux_os_type,
      servicos: services,
      tipo_os: {
        tipo_os_item: {
          tipo_os_sigla: aux_os_type,
          consultor_documento: await this.formatarDoc(order.consultant?.cod_consultor),
        },
      },
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
