import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { isArray } from 'class-validator';

import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateOsDTO, ServicoCreateDTO } from 'src/dealernet/dto/create-os.dto';
import { MarcacaoUpdateDto, ProdutoUpdateDto, ServicoUpdateDto, UpdateOsDTO } from 'src/dealernet/dto/update-os.dto';
import { TipoOSItemCreateDTO } from 'src/dealernet/order/dto/create-order.dto';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';
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
      const budget = await this.petroplay.order.findOrderBudget(order_id, budget_id);
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

    const budgets = await this.petroplay.order.findOrderBudget(order.id, budget_id);

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

    const budgets = await this.petroplay.order.findOrderBudget(order.id, budget_id);

    Logger.log(`Rota Create: Montando itens da ordem ${order_id}`, 'OsService');
    const os = [];
    for await (const budget of budgets.filter((x) => !x.os_number)) {
      const schema = await this.osDtoToDealernetOs(order, budget, integration.dealernet);

      await this.dealernet.order.createOs(integration.dealernet, schema).then(async (response) => {
        await this.petroplay.order.updateOrderBudget(order_id, budget.id, {
          os_number: response.NumeroOS?.toString(),
          integration_data: response,
        });
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
    const tipo_os_sigla = order?.os_type?.external_id;
    const os_types: TipoOSItemCreateDTO[] = [];

    const services: ServicoCreateDTO[] = [];
    for await (const service of budget.services.filter((x) => x.is_approved)) {
      const os_type = service?.os_type ?? budget?.os_type ?? order?.os_type;
      if (!os_types?.find((x) => x.tipo_os_sigla == os_type.external_id)) {
        os_types.push({
          tipo_os_sigla: os_type.external_id,
          consultor_documento: await this.formatarDoc(order.consultant?.cod_consultor),
        });
      }

      services.push({
        tipo_os_sigla,
        tmo_referencia: service.integration_id,
        tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
        valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
        quantidade: Number(service.quantity) > 0 ? Math.ceil(service.quantity) : 1,
        cobra: service?.is_charged_for ?? true,
        produtos: [],
      });

      // if (!aux_os_type) {
      //   aux_os_type = budget?.os_type?.external_id;
      // }
      // let already_used_os_type_products = false;
      // for await (const product of budget.products) {
      //   if (!aux_os_type) {
      //     aux_os_type = product?.os_type?.external_id;
      //   }
      //   if (!os_types?.some((type) => type === product.os_type.external_id)) {
      //     os_types.push(product.os_type.external_id);
      //   }
      //   const tipo_os_sigla = product?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
      //   const product_validate = await this.dealernet.findProductByReference(connection, product.integration_id);
      //   const product_validate_checked = product_validate?.first((product_check) => product_check?.QuantidadeDisponivel > 0);
      //   if (product_validate_checked) {
      //     const productEntry = {
      //       tipo_os_sigla,
      //       produto_referencia: product.integration_id,
      //       valor_unitario: Number(product.price) > 0 ? Number(product.price) : 0.01,
      //       quantidade: Number(product.quantity) > 0 ? Number(product.quantity) : 1,
      //     };
      //     if (product.service_id) {
      //       products_hashtable[product.service_id] = [...(products_hashtable[product.service_id] || []), productEntry];
      //     } else {
      //       products_hashtable[aux_os_type] = [...(products_hashtable[aux_os_type] || []), productEntry];
      //     }
      //   } else {
      //     Logger.warn(
      //       `Produto ${product.integration_id}  ${product.name} não encontrado ou sem quantidade disponível`,
      //       'OsService',
      //     );
      //   }
      // }
      // budget.services.map((service) => {
      //   if (!aux_os_type) {
      //     aux_os_type = service?.os_type?.external_id;
      //   }
      //   if (!os_types?.some((type) => type === service.os_type.external_id)) {
      //     os_types.push(service.os_type.external_id);
      //   }
      //   const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
      //   let produtos = [];
      //   if (products_hashtable[service.service_id]) {
      //     produtos = [...products_hashtable[service.service_id]];
      //   } else if (products_hashtable[aux_os_type] && !already_used_os_type_products) {
      //     produtos = [...products_hashtable[aux_os_type]];
      //     already_used_os_type_products = true;
      //   }
      //   services.push({
      //     tipo_os_sigla,
      //     tmo_referencia: service.integration_id,
      //     tempo: Number(service.quantity) > 0 ? Number(service.quantity) : 0.01,
      //     valor_unitario: Number(service.price) > 0 ? Number(service.price) : 0.01,
      //     quantidade: Number(service.quantity) > 0 ? Math.ceil(service.quantity) : 1,
      //     produtos,
      //   });
      // });
    }

    for await (const product of budget.products.filter((x) => x.is_approved)) {
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
      consultor_documento: await this.formatarDoc(cod_consultor),
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

  async appointmentXmlSchema(order_id: string, budget_id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);

    const budget = await this.petroplay.order.findOrderBudget(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);

    return this.dealernet.order.updateOsXmlSchema(integration.dealernet, osDTO);
  }

  async appointment(order_id: string, budget_id: string): Promise<DealernetOrderResponse> {
    const order = await this.petroplay.order.findById(order_id, ['consultant', 'os_type', 'budgets']);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    const budget = await this.petroplay.order.findOrderBudget(order.id, budget_id).then((budgets) => budgets?.first());
    const appointments = await this.petroplay.order.findOrderAppointments(order.id, budget.id);
    const osDTO = await this.osDtoAppointments(order, budget, appointments, integration.dealernet);
    const os = await this.dealernet.order.updateOs(integration.dealernet, osDTO);

    appointments.map(async ({ id }) => this.petroplay.order.updateOrderAppointment(order.id, id, { was_sent_to_dms: true }));

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
  ): Promise<UpdateOsDTO> {
    const services_key_hashtable = {};
    const integration_data_services = budget.integration_data?.Servicos;
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

      let usuario_ind_responsavel: string;
      let produtivo_documento: string;
      const aux_appointments: MarcacaoUpdateDto[] = [];

      for await (const item of appointments.filter((x) => !x.was_sent_to_dms && x.integration_id == service.integration_id)) {
        const user = await this.dealernet.customer.findUser(connection, item?.mechanic.cod_consultor);
        usuario_ind_responsavel = user.Usuario_Identificador;
        produtivo_documento = user.Usuario_DocIdentificador;

        const marcacao = {
          usuario_documento_produtivo: user.Usuario_Identificador,
          data_inicial: new Date(item.start_date).formatUTC('yyyy-MM-ddThh:mm:ss'),
          data_final: new Date(item.end_date).formatUTC('yyyy-MM-ddThh:mm:ss'),
          motivo_parada: item?.reason_stopped?.external_id,
          observacao: '?',
        };

        aux_appointments.push(marcacao);
      }

      const tipo_os_sigla = service?.os_type?.external_id || budget?.os_type?.external_id || order?.os_type?.external_id;
      const Servicos = budget.integration_data?.os?.Servicos;
      const chave = Servicos?.first((x: any) => x.TMOReferencia == service.integration_id)?.Chave;

      services.push({
        chave: chave,
        tipo_os_sigla,
        tmo_referencia: service.integration_id,
        tempo: service.quantity,
        valor_unitario: service.price,
        quantidade: Math.ceil(service.quantity),
        usuario_ind_responsavel,
        produtivo_documento,
        produtos: Servicos.Produtos,
        marcacoes: aux_appointments,
      });
    }

    const OS: UpdateOsDTO = {
      chave: budget.integration_data?.os.Chave,
      numero_os: budget.os_number,
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
