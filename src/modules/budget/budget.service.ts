import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { CreateDealernetBudgetDTO } from 'src/dealernet/budget/dto/create-budget.dto';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ProdutoCreateDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
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

  async createSchema(order_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    Logger.log(`Rota Create: Buscando itens da orçamento ${order_id}`, 'BudgetService');
    order.items = await this.petroplay.order.findItems(order_id);

    Logger.log(`Rota Create: Montando itens da orçamento ${order_id}`, 'BudgetService');
    const osDTO = await this.osDtoToDealernetOs(order);

    return this.dealernet.budget.createXmlSchema(integration.dealernet, osDTO as any);
  }

  async create(order_id: string, dto: CreateDealernetBudgetDTO): Promise<DealernetBudgetResponse> {
    const integration = await this.petroplay.integration.findByClientId(order_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dealernet.budget.create(integration.dealernet, dto);
  }

  async osDtoToDealernetOs(order: PetroplayOrderEntity): Promise<CreateOsDTO> {
    const products: ProdutoCreateDTO[] = order.items
      .map(({ products }) => {
        return products.map((item) => ({
          tipo_os_sigla: order.os_type.external_id,
          produto_referencia: item.product.internal_id,
          valor_unitario: item.product.price,
          quantidade: item.quantity,
        })) as ProdutoCreateDTO[];
      })
      .flatMap((item) => item);

    const services: ServicoCreateDTO[] = order.items
      .map(({ service }) => {
        const tasks = service.items.filter((x) => x.entity_type == 'task').map((serviceItem) => serviceItem);
        const productsAdditional = service.items
          .filter((x) => x.entity_type == 'product')
          .map((serviceItem) => ({
            tipo_os_sigla: order.os_type.external_id,
            produto_referencia: serviceItem.product.internal_id,
            valor_unitario: serviceItem.product.price,
            quantidade: serviceItem.quantity,
          }));

        return tasks.map((item, index) => ({
          tipo_os_sigla: order.os_type.external_id,
          tmo_referencia: item.task.internal_id,
          tempo: item.quantity,
          valor_unitario: item.task.price,
          quantidade: Math.ceil(item.quantity),
          produtos: index == 0 ? [...products, ...productsAdditional] : productsAdditional,
        })) as ServicoCreateDTO[];
      })
      .flatMap((item) => item);

    const OS: CreateOsDTO = {
      veiculo_placa_chassi: order.vehicle_chassis_number,
      veiculo_Km: Number(order.mileage) || 0,
      cliente_documento: order.customer_document,
      consultor_documento: await this.formatarDoc(order.consultant?.cod_consultor),
      data: new Date(order.inspection).toISOString(),
      data_final: new Date().toISOString(),
      data_prometida: new Date(order.conclusion).toISOString(),
      nro_prisma: order.prisma,
      observacao: order.notes,
      prisma_codigo: order.prisma,
      tipo_os_sigla: order.os_type?.external_id,
      servicos: services,
      tipo_os: {
        tipo_os_item: {
          tipo_os_sigla: order.os_type?.external_id,
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
