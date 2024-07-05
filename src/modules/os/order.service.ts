import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { MarcacaoUpdateDto, ProdutoUpdateDto, ServicoUpdateDto, UpdateOsDTO } from 'src/dealernet/dto/update-os.dto';
import { DealernetOrder } from 'src/dealernet/response/os-response';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { OrderAppointmentEntity } from 'src/petroplay/order/entity/order-appointment.entity';
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

    const osDTO = await this.osDtoToDealernetOs(order, budgets, integration.dealernet);

    return this.Dealernet.order.createOsXmlSchema(integration.dealernet, osDTO);
  }

  async createOs(order_id: string, budget_id?: string): Promise<DealernetOrder[]> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const budgets = await this.petroplay.order.findOrderBudget(order.id, budget_id);

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const os = [];
    for await (const budget of budgets.filter((x) => !x.os_number)) {
      const schema = await this.osDtoToDealernetOs(order, [budget], integration.dealernet);

      await this.Dealernet.order.createOs(integration.dealernet, schema).then(async (response) => {
        await this.petroplay.order.updateOrderBudget(order_id, budget.id, {
          os_number: response.NumeroOS,
          integration_data: response,
        });
        os.push(response);
      });
    }

    return os;
  }

  async osDtoToDealernetOs(
    order: PetroplayOrderEntity,
    budgets: OrderBudgetEntity[],
    connection: IntegrationDealernet,
  ): Promise<CreateOsDTO> {
    const services: ServicoCreateDTO[] = [];
    const products_hashtable = {};
    const os_types: string[] = [];
    let aux_os_type = order?.os_type?.external_id;
    for await (const budget of budgets) {
      if (!aux_os_type) {
        aux_os_type = budget?.os_type?.external_id;
      }
      let already_used_os_type_products = false;

      for await (const product of budget.products) {
        if (!aux_os_type) {
          aux_os_type = product?.os_type?.external_id;
        }

        if (!os_types?.some((type) => type === product.os_type.external_id)) {
          os_types.push(product.os_type.external_id);
        }

        const tipo_os_sigla = product?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
        const product_validate = await this.Dealernet.findProductByReference(connection, product.integration_id);

        const product_validate_checked = product_validate?.first((product_check) => product_check?.QuantidadeDisponivel > 0);

        if (product_validate_checked) {
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
        }
      }

      budget.services.map((service, index) => {
        if (!aux_os_type) {
          aux_os_type = service?.os_type?.external_id;
        }
        if (!os_types?.some((type) => type === service.os_type.external_id)) {
          os_types.push(service.os_type.external_id);
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
    }

    const OS: CreateOsDTO = {
      veiculo_placa_chassi: order.vehicle_chassis_number,
      tipo_os_array: os_types,
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

  async updateXmlSchemaOs(order_id: string, budget_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    if (!integration) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudget(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);

    return this.Dealernet.order.updateOsXmlSchema(integration.dealernet, osDTO);
  }

  async updateOs(order_id: string, budget_id: string): Promise<DealernetOrder> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudget(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);
    const result = await this.Dealernet.order.updateOs(integration.dealernet, osDTO);
    appointments.map(async (appointment) => {
      await this.petroplay.order.updateOrderAppointment(order.id, appointment.id, { was_sent_to_dms: false });
    });
    return result;
  }

  async osDtoAppointments(
    order: PetroplayOrderEntity,
    budget: OrderBudgetEntity,
    appointments: OrderAppointmentEntity[],
    connection: IntegrationDealernet,
  ): Promise<UpdateOsDTO> {
    const services_key_hashtable = {};
    const integration_data_services = budget.integration_data?.Servicos.Servico;
    if (isArray(integration_data_services)) {
      integration_data_services.map((service) => {
        if (service.TMOReferencia) {
          services_key_hashtable[service.TMOReferencia] = service?.Chave;
        }
      });
    }

    const products: ProdutoUpdateDto[] = [];
    const services: ServicoUpdateDto[] = [];
    let aux_os_type = order?.os_type?.external_id;
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
        valor_unitario: product.price,
        quantidade: product.quantity,
      });
    });

    for (const service of budget.services) {
      if (!aux_os_type) {
        aux_os_type = service?.os_type?.external_id;
      }
      let usuario_ind_responsavel;
      let produtivo_documento;
      const aux_appointments: MarcacaoUpdateDto[] = [];
      for (const appointment of appointments || []) {
        if (!appointment?.was_sent_to_dms) {
          if (appointment.integration_id === service.integration_id) {
            const user = await this.Dealernet.customer.findUser(connection, appointment?.mechanic.cod_consultor);
            appointment.was_sent_to_dms = true;
            (usuario_ind_responsavel = user.Usuario_Identificador), (produtivo_documento = user.Usuario_DocIdentificador);

            aux_appointments.push({
              usuario_documento_produtivo: user.Usuario_Identificador,
              data_inicial: await this.formatDate(appointment.start_date),
              data_final: await this.formatDate(appointment.end_date, appointment.start_date),
              motivo_parada: appointment?.reason_stopped?.external_id,
              observacao: '?',
            });
          }
        }
      }
      const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
      services.push({
        chave: services_key_hashtable[service.integration_id],
        tipo_os_sigla,
        tmo_referencia: service.integration_id,
        tempo: service.quantity,
        valor_unitario: service.price,
        quantidade: Math.ceil(service.quantity),
        usuario_ind_responsavel,
        produtivo_documento,
        produtos: services.length == 0 ? [...products] : [],
        marcacoes: aux_appointments,
      });
    }

    const OS: UpdateOsDTO = {
      chave: budget.integration_data?.Chave,
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
