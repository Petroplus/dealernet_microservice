import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { formatarDoc } from 'src/commons';
import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import {
  UpdateDealernetOsDTO,
  UpdateDealernetServiceDTO,
  UpdateDealernetServiceProductDTO,
  UpdateDealernetTipoOSDto,
} from 'src/dealernet/order/dto/update-order.dto';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { OsServiceService } from '../../os-service.service';

import { AttachOsServiceProdutoDto } from './dto/attach-os-service-produto';

@Injectable()
export class OsServiceProductService {
  constructor(
    private readonly context: ContextService,
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
    private readonly osServiceService: OsServiceService,
  ) {}

  async attach(order_id: string, budget_id: string, budget_service_id: string, dto: AttachOsServiceProdutoDto): Promise<unknown> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const schema = await this.attachDtoToSchema(integration.dealernet, order, budget_id, budget_service_id, [dto]);

    return this.dealernet.order.updateOs(integration.dealernet, schema);
  }

  async attachSchema(
    order_id: string,
    budget_id: string,
    budget_service_id: string,
    dtos: AttachOsServiceProdutoDto[],
  ): Promise<string> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const schema = await this.attachDtoToSchema(integration.dealernet, order, budget_id, budget_service_id, dtos);

    return this.dealernet.order.updateOsXmlSchema(integration.dealernet, schema);
  }

  async attachDtoToSchema(
    connection: IntegrationDealernet,
    order: PetroplayOrderEntity,
    budget_id: string,
    order_budget_service_id: string,
    dtos: AttachOsServiceProdutoDto[],
  ): Promise<UpdateDealernetOsDTO> {
    const budget = await this.petroplay.order.findOrderBudgetById(order.id, budget_id);
    if (!budget) throw new BadRequestException('Budget not found');

    const os = await this.dealernet.findOsByNumber(connection, budget.os_number);
    if (!os) throw new BadRequestException(`OS not found`);

    const service = budget.services.find((s) => s.id === order_budget_service_id);
    if (!service) throw new BadRequestException('Service not found');

    const Produtos: UpdateDealernetServiceProductDTO[] = [];

    for await (const dto of dtos) {
      const product = budget.products.find((p) => p.order_budget_service_id === service.id && p.id === dto.id);

      const os_type = product?.os_type ?? service.os_type ?? budget?.os_type ?? order?.os_type;

      const produtos = await this.dealernet.findProductByReference(connection, product.integration_id);
      const produto = produtos
        ?.orderBy((x) => x.QuantidadeDisponivel, 'desc')
        .find((x) => x.ProdutoReferencia == product.integration_id);

      if (!produto || produto.ProdutoCodigo == 0) {
        Logger.warn(`Produto ${product.integration_id}  ${product.name} não encontrado`, 'OsService');
        await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, dto.product_id, {
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
        await this.petroplay.order.updateOrderBudgetProduct(budget.order_id, budget.id, dto.product_id, {
          is_error: true,
          error_details: 'Produto sem quantidade disponível',
        });
      }
    }

    const Servicos = os.Servicos.filter(
      (s) => s.TMOReferencia === service.integration_id && s.TipoOSSigla === service.os_type.external_id,
    ).map((Servico) => ({
      ...Servico,
      Produtos: Produtos,
    }));

    const TipoOS: UpdateDealernetTipoOSDto[] = Servicos.map((s) => ({
      TipoOSSigla: s.TipoOSSigla,
      ConsultorDocumento: formatarDoc(os.TipoOS.first().ConsultorDocumento),
    }));

    return {
      Chave: os.Chave,
      NumeroOS: os.NumeroOS,
      VeiculoPlacaChassi: os.VeiculoPlaca,
      VeiculoKM: os.VeiculoKM,
      ClienteCodigo: os.ClienteCodigo,
      ClienteDocumento: formatarDoc(os.ClienteDocumento),
      ConsultorDocumento: formatarDoc(os.TipoOS.first().ConsultorDocumento),
      Data: os.Data,
      Status: os.TipoOS.first().StatusAndamento,
      DataPrometida: os.DataPrometida,
      Observacao: os.Observacao,
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
    } satisfies UpdateDealernetOsDTO;
  }

  async cancel(order_id: string, budget_id: string, budget_service_id: string, id: string): Promise<unknown> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    Logger.warn('Gerando schema para atualizar status do serviço para Pendente', 'OsServiceProductService.cancel');
    const update = await this.osServiceService.updateDtoToSchema(integration.dealernet, order, budget_id, [
      { id: budget_service_id, StatusExecucao: 'Pendente', Produtos: [{ id, StatusExecucao: 'Pendente' }] },
    ]);

    Logger.warn('Atualizando status do serviço para Pendente', 'OsServiceProductService.cancel');
    await this.dealernet.order.updateOs(integration.dealernet, update);

    Logger.warn('Gerando schema para cancelar serviço', 'OsServiceProductService.cancel');

    const schema = await this.cancelDtoToSchema(integration.dealernet, order, budget_id, budget_service_id, id);

    return this.dealernet.order.cancelServiceOrProduct(integration.dealernet, schema);
  }

  async cancelXmlSchema(order_id: string, budget_id: string, budget_service_id: string, id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const schema = await this.cancelDtoToSchema(integration.dealernet, order, budget_id, budget_service_id, id);

    return this.dealernet.order.cancelXmlSchema(integration.dealernet, schema);
  }

  async cancelDtoToSchema(
    connection: IntegrationDealernet,
    order: PetroplayOrderEntity,
    budget_id: string,
    budget_service_id: string,
    id: string,
  ): Promise<UpdateDealernetOsDTO> {
    const budget = await this.petroplay.order.findOrderBudgetById(order.id, budget_id);
    if (!budget) throw new BadRequestException('Budget not found');

    const dto = await this.osServiceService.updateDtoToSchema(connection, order, budget_id, [
      { id: budget_service_id, Produtos: [{ id }] },
    ]);

    dto.Servicos = dto.Servicos.map((service) => {
      const Produtos = service.Produtos.map((product) => ({
        Chave: product.Chave,
        Selecionado: product.Selecionado,
      }));

      return {
        Chave: service.Chave,
        Selecionado: false,
        Produtos: Produtos,
      };
    });

    return dto;
  }
}
