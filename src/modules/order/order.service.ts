import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ProdutoCreateDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { DealernetOrder } from 'src/dealernet/response/os-response';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { OrderFilter } from './filters/order.filters';
import { MarcacaoUpdateDto, ProdutoUpdateDto, ServicoUpdateDto, UpdateOsDTO } from 'src/dealernet/dto/update-os.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly Dealernet: DealernetService,
  ) {}

  async find(client_id: string, filter: OrderFilter): Promise<DealernetOrder[]> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.Dealernet.order.findOS(integration.dealernet, filter);
  }

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

  async create(client_id: string, dto: CreateOsDTO): Promise<DealernetOrder> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.Dealernet.order.createOs(integration.dealernet, dto);
  }

  async getXmlSchema(client_id: string, dto: CreateOsDTO): Promise<string> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.Dealernet.order.createOsXmlSchema(integration.dealernet, dto);
  }

  async createXmlSchemaOsByOrderId(order_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    if (!integration) throw new BadRequestException('Integration not found');

    Logger.log(`Rota Create: Buscando itens da ordem ${order_id}`, 'OsService');

    // await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');
    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const osDTO = await this.osDtoToDealernetOs(order);

    return this.Dealernet.order.createOsXmlSchema(integration.dealernet, osDTO);
  }

  async createOsByOrderId(order_id): Promise<DealernetOrder> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    Logger.log(`Rota Create: Buscando itens da ordem ${order_id}`, 'OsService');
    order.items = await this.petroplay.order.findItems(order_id);

    await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const osDTO = await this.osDtoToDealernetOs(order);

    const result = await  this.Dealernet.order.createOs(integration.dealernet, osDTO);
    await this.petroplay.order.updateOrder(order_id,{integration_data: result})
    return result
  }
  async osDtoToDealernetOs(order: PetroplayOrderEntity): Promise<CreateOsDTO> {
    const orderBudget = await this.petroplay.order.findOrderBudget(order.id)
    const products: ProdutoCreateDTO[] = []
    const services: ServicoCreateDTO[] = []

    let aux_os_type =  order?.os_type?.external_id
    orderBudget.map(budget=>{
      if(!aux_os_type){
        aux_os_type= budget?.os_type?.external_id
      }
      budget.products.map(product=>{
        if(!aux_os_type){
          aux_os_type=  product?.os_type?.external_id
        }
          const tipo_os_sigla = product?.os_type?.external_id || budget?.os_type?.external_id ||  order?.os_type?.external_id
          products.push({
            tipo_os_sigla,
            produto_referencia: product.integration_id,
            valor_unitario: product.price,
            quantidade: product.quantity,
          })
      })

      budget.services.map((service,index )=>{
        if(!aux_os_type){
          aux_os_type= service?.os_type?.external_id
        }
        const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id ||  order?.os_type?.external_id
        services.push({
          tipo_os_sigla,
          tmo_referencia: service.integration_id,
          tempo: service.quantity,
          valor_unitario: service.price,
          quantidade: Math.ceil(service.quantity),
          produtos: index == 0 ? [...products] : [],
        })
      })
    })

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

  async updateXmlSchemaOsByOrderId(order_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    if (!integration) throw new BadRequestException('Integration not found');

    Logger.log(`Rota Create: Buscando itens da ordem ${order_id}`, 'OsService');

    // await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');
    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const osDTO = await this.osDtoToDealenrtOsAppointments(order)

    return this.Dealernet.order.updateOsXmlSchema(integration.dealernet, osDTO);
  }
  async updateOsByOrderId(order_id): Promise<DealernetOrder> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    Logger.log(`Rota Create: Buscando itens da ordem ${order_id}`, 'OsService');

    await this.petroplay.order.updateStatus(order_id, 'AWAIT_SEND_OS');

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const osDTO = await this.osDtoToDealenrtOsAppointments(order)

    return this.Dealernet.order.updateOs(integration.dealernet, osDTO);
  }

  async osDtoToDealenrtOsAppointments(order: PetroplayOrderEntity): Promise<UpdateOsDTO> {
    const appointments = await this.petroplay.order.findOrderAppointments(order.id)
    const orderBudget = await this.petroplay.order.findOrderBudget(order.id)
    const products: ProdutoUpdateDto[] = []
    const services: ServicoUpdateDto[] = []
    let aux_os_type =  order?.os_type?.external_id
    orderBudget.map(budget=>{
      if(!aux_os_type){
        aux_os_type= budget?.os_type?.external_id
      }
      budget.products.map(product=>{
        if(!aux_os_type){
          aux_os_type=  product?.os_type?.external_id
        }
          const tipo_os_sigla = product?.os_type?.external_id || budget?.os_type?.external_id ||  order?.os_type?.external_id
          products.push({
            tipo_os_sigla,
            produto_referencia: product.integration_id,
            valor_unitario: product.price,
            quantidade: product.quantity,
          })
      })

      budget.services.map((service,index )=>{
        if(!aux_os_type){
          aux_os_type= service?.os_type?.external_id
        }
        const aux_appointments: MarcacaoUpdateDto[] =[]
        appointments?.map(async appointment=>{
          if(appointment.integration_id === service.integration_id){
            aux_appointments.push({
              usuario_documento_produtivo: '?',
              data_inicial:await this.formatDate(appointment.start_date),
              data_final:await this.formatDate(appointment.start_date),
              motivo_parada:"?",
              observacao:"?"
            })

          }
        })
        const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id ||  order?.os_type?.external_id
        services.push({
          tipo_os_sigla,
          tmo_referencia: service.integration_id,
          tempo: service.quantity,
          valor_unitario: service.price,
          quantidade: Math.ceil(service.quantity),
          produtos: index == 0 ? [...products] : [],
          marcacoes: aux_appointments
        })
      })
    })

    const OS: UpdateOsDTO = {
      chave: order.integration_data?.Chave,
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
  async formatDate(date?: Date): Promise<string> {
      if(!date){
        return '?'
        }
      date = new Date(date)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
}
}
