import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { formatarDoc } from 'src/commons';
import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import {
  UpdateDealernetOsDTO,
  UpdateDealernetServiceDTO,
  UpdateDealernetServiceProductDTO,
  UpdateDealernetTipoOSDto,
} from 'src/dealernet/order/dto/update-order.dto';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { UpdateOsServiceDto } from './dto/update-os-service.dto';

@Injectable()
export class OsServiceService {
  constructor(
    private readonly context: ContextService,
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}

  async update(order_id: string, budget_id: string, dtos: UpdateOsServiceDto[]): Promise<DealernetOrderResponse> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new NotFoundException('Integration not found');

    const schema = await this.updateDtoToSchema(integration.dealernet, order, budget_id, dtos);

    return this.dealernet.order.updateOs(integration.dealernet, schema);
  }

  async updateXmlSchema(order_id: string, budget_id: string, dtos: UpdateOsServiceDto[]): Promise<string> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new NotFoundException('Integration not found');

    const schema = await this.updateDtoToSchema(integration.dealernet, order, budget_id, dtos);

    return this.dealernet.order.updateOsXmlSchema(integration.dealernet, schema);
  }

  async updateDtoToSchema(
    connection: IntegrationDealernet,
    order: PetroplayOrderEntity,
    budget_id: string,
    dtos: UpdateOsServiceDto[],
  ): Promise<UpdateDealernetOsDTO> {
    const budget = await this.petroplay.order.findOrderBudgetById(order.id, budget_id);
    if (!budget) throw new BadRequestException('Budget not found');

    const os = await this.dealernet.findOsByNumber(connection, budget.os_number);
    if (!os) throw new NotFoundException(`OS not found`);

    const Servicos: UpdateDealernetServiceDTO[] = [];
    for await (const { id: service_id, ...service } of dtos) {
      const pps_service = budget.services.find((s) => s.id == service_id);
      const dealernet_service = os.Servicos.find(
        (s) => s.TipoOSSigla == pps_service?.os_type?.external_id && s.TMOReferencia == pps_service?.integration_id,
      );

      if (pps_service && dealernet_service) {
        const Produtos: UpdateDealernetServiceProductDTO[] = [];
        for await (const { id: product_id, ...product } of service?.Produtos ?? []) {
          const pps_product = budget.products.find((pp) => pp.id == product_id);
          const dealernet_product = dealernet_service.Produtos.find(
            (dp) =>
              dp.TipoOSSigla == (pps_product?.os_type?.external_id ?? pps_service?.os_type?.external_id) &&
              dp.ProdutoReferencia == pps_product?.integration_id,
          );

          if (pps_product && dealernet_product) {
            Produtos.push({
              Chave: dealernet_product.Chave,
              TipoOSSigla: dealernet_product.TipoOSSigla,
              Produto: dealernet_product.Produto,
              ProdutoReferencia: dealernet_product.ProdutoReferencia,
              ValorUnitario: dealernet_product.ValorUnitario,
              Quantidade: dealernet_product.Quantidade,
              Desconto: dealernet_product.Desconto,
              DescontoPercentual: dealernet_product.DescontoPercentual,
              KitCodigo: dealernet_product.KitCodigo,
              CampanhaCodigo: dealernet_product.CampanhaCodigo,
              ...product,
              StatusExecucao: product?.StatusExecucao ?? service?.StatusExecucao ?? undefined,
              Selecionado: true,
            });
          }
        }

        Servicos.push({
          Chave: dealernet_service.Chave,
          TipoOSSigla: dealernet_service.TipoOSSigla,
          TMOReferencia: dealernet_service.TMOReferencia,
          Tempo: dealernet_service.Tempo,
          ValorUnitario: dealernet_service.ValorUnitario,
          Quantidade: dealernet_service.Quantidade,
          ProdutivoDocumento: dealernet_service.ProdutivoDocumento,
          UsuarioIndResponsavel: dealernet_service.UsuarioIndResponsavel,
          Cobrar: dealernet_service.Cobrar,
          Executar: dealernet_service.Executar,
          Observacao: dealernet_service.Observacao,
          ...service,
          Produtos: Produtos,
          Selecionado: true,
        });
      }
    }

    const TipoOS: UpdateDealernetTipoOSDto[] = Servicos.map((s) => ({
      TipoOSSigla: s.TipoOSSigla,
      ConsultorDocumento: formatarDoc(os.TipoOS.first().ConsultorDocumento),
    }));

    const user = this.context.currentUser();

    return {
      Chave: os.Chave,
      NumeroOS: os.NumeroOS,
      VeiculoPlacaChassi: os.VeiculoPlaca,
      VeiculoKM: os.VeiculoKM,
      ClienteCodigo: os.ClienteCodigo,
      ClienteDocumento: formatarDoc(os.ClienteDocumento),
      ConsultorDocumento: formatarDoc(user?.cod_consultor ?? os.TipoOS.first().ConsultorDocumento),
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

  async cancel(order_id: string, budget_id: string, id: string): Promise<DealernetOrderResponse> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new NotFoundException('Integration not found');

    Logger.warn('Gerando schema para atualizar status do serviço para Pendente', 'OsServiceService.cancelService');
    const update = await this.updateDtoToSchema(integration.dealernet, order, budget_id, [
      { id: id, StatusExecucao: 'Pendente' },
    ]);

    Logger.warn('Atualizando status do serviço para Pendente', 'OsServiceService.cancelService');
    await this.dealernet.order.updateOs(integration.dealernet, update);

    Logger.warn('Gerando schema para cancelar serviço', 'OsServiceService.cancelService');
    const schema = await this.cancelSchema(integration.dealernet, order, budget_id, id);

    Logger.warn('Cancelando serviço', 'OsServiceService.cancelService');
    return this.dealernet.order.cancelServiceOrProduct(integration.dealernet, schema);
  }

  async cancelXmlSchema(order_id: string, budget_id: string, id: string): Promise<string> {
    const order = await this.petroplay.order.findById(order_id);

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new NotFoundException('Integration not found');

    const schema = await this.cancelSchema(integration.dealernet, order, budget_id, id);

    return this.dealernet.order.cancelXmlSchema(integration.dealernet, schema);
  }

  async cancelSchema(
    connection: IntegrationDealernet,
    order: PetroplayOrderEntity,
    budget_id: string,
    id: string,
  ): Promise<UpdateDealernetOsDTO> {
    const budget = await this.petroplay.order.findOrderBudgetById(order.id, budget_id);
    if (!budget) throw new BadRequestException('Budget not found');

    const os = await this.dealernet.findOsByNumber(connection, budget.os_number);
    if (!os) throw new NotFoundException(`OS not found`);

    const dto = await this.updateDtoToSchema(connection, order, budget_id, [{ id: id, StatusExecucao: 'Pendente' }]);

    const pps_service = budget.services.find((s) => s.id == id);
    const dealernet_service = os.Servicos.find(
      (s) => s.TipoOSSigla == pps_service?.os_type?.external_id && s.TMOReferencia == pps_service?.integration_id,
    );

    dto.Servicos = [
      {
        Chave: dealernet_service.Chave,
        Selecionado: true,
      },
    ];

    return dto;
  }
}
