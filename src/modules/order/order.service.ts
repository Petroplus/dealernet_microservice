import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { OrderFilter } from './filters/order.filters';
import { DealernetOrder } from 'src/dealernet/response/os-response';
import { CreateOsDTO, ProdutoCreateDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dialernet: DealernetService
  ) {}

  async find(client_id: string, filter: OrderFilter): Promise<DealernetOrder[]> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dialernet.order.findOS(integration.dealernet, filter);
  }

  async findByPPsOrderId(order_id: string): Promise<DealernetOrder[]> {
    const order = await this.petroplay.order.findById(order_id);
    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    if (!order.integration_id) throw new HttpException(`Order '${order_id}' not sent to Dealernet`, 404);
    const filter: OrderFilter = {
      integration_id: order.integration_id,
    };
    return await this.dialernet.order.findOS(integration.dealernet, filter);
  }

  async create(client_id: string, dto: CreateOsDTO): Promise<DealernetOrder> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dialernet.order.createOs(integration.dealernet, dto);
  }

  async getXmlSchema(client_id: string, dto: CreateOsDTO): Promise<string> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dialernet.order.createOsXmlSchema(integration.dealernet, dto);
  }

  async createXmlSchemaOsByOrderId(order_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    Logger.log(`Rota Create: Buscando itens da ordem ${order_id}`, 'OsService');
    order.items = await this.petroplay.order.findItems(order_id);

    // await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');
    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const osDTO = await this.osDtoToDealernetOs(order);

    return this.dialernet.order.createOsXmlSchema(integration.dealernet, osDTO);
  }

  async createOsByOrderId(order_id): Promise<DealernetOrder> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    Logger.log(`Rota Create: Buscando itens da ordem ${order_id}`, 'OsService');
    order.items = await this.petroplay.order.findItems(order_id);

    await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const osDTO = await this.osDtoToDealernetOs(order);

    return this.dialernet.order.createOs(integration.dealernet, osDTO);
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
        const productsAditional = service.items
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
          produtos: index == 0 ? [...products, ...productsAditional] : productsAditional,
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
