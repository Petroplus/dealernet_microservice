import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ProdutoCreateDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { DealernetOrder } from 'src/dealernet/response/os-response';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { OrderBudgetEntity } from 'src/petroplay/order/entity/order-budget.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { OrderFilter } from './filters/order.filters';

@Injectable()
export class OsService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly Dealernet: DealernetService,
  ) {}

  async findByPPsOrderId(order_id: string): Promise<DealernetOrder[]> {
    const order = await this.petroplay.order.findById(order_id);
    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    if (!order.integration_id) throw new HttpException(`Order '${order_id}' not sent to Dealernet`, 404);
    const filter: OrderFilter = {
      integration_id: order.integration_id,
    };
    return await this.Dealernet.order.findOS(integration.dealernet, filter);
  }

  async createSchema(order_id: string, budget_id?: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    if (!integration) throw new BadRequestException('Integration not found');

    const budgets = await this.petroplay.order.findOrderBudget(order.id, budget_id);

    const osDTO = await this.osDtoToDealernetOs(order, budgets);

    return this.Dealernet.order.createOsXmlSchema(integration.dealernet, osDTO);
  }

  async createOs(order_id: string, budget_id?: string): Promise<DealernetOrder[]> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');

    const budgets = await this.petroplay.order.findOrderBudget(order.id, budget_id);

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const os = [];
    for await (const budget of budgets.filter((x) => !x.os_number)) {
      const schema = await this.osDtoToDealernetOs(order, [budget]);

      await this.Dealernet.order.createOs(integration.dealernet, schema).then(async (response) => {
        await this.petroplay.order.updateOrderBudget(order_id, budget.id, { os_number: response.NumeroOS });
        os.push(response);
      });
    }

    return os;
  }

  async osDtoToDealernetOs(order: PetroplayOrderEntity, budgets: OrderBudgetEntity[]): Promise<CreateOsDTO> {
    const products: ProdutoCreateDTO[] = [];
    const services: ServicoCreateDTO[] = [];

    let aux_os_type = order?.os_type?.external_id;
    budgets.map((budget) => {
      if (!aux_os_type) {
        aux_os_type = budget?.os_type?.external_id;
      }
      budget.products.map((product) => {
        if (!aux_os_type) {
          aux_os_type = product?.os_type?.external_id;
        }
        const tipo_os_sigla = product?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
        products.push({
          tipo_os_sigla,
          produto_referencia: product.integration_id,
          valor_unitario: Number(product.price) > 0 ? Number(product.price) : 0.01,
          quantidade: Number(product.quantity) > 0 ? Number(product.quantity) : 1,
        });
      });

      budget.services.map((service, index) => {
        if (!aux_os_type) {
          aux_os_type = service?.os_type?.external_id;
        }
        const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
        services.push({
          tipo_os_sigla,
          tmo_referencia: service.integration_id,
          tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
          valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
          quantidade: Number(service.quantity) > 0 ? Math.ceil(service.quantity) : 1,
          produtos: index == 0 ? [...products] : [],
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
