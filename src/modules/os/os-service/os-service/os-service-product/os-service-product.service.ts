import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { UpdateDealernetOsDTO } from 'src/dealernet/order/dto/update-order.dto';
import { IntegrationDealernet } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayOrderEntity } from 'src/petroplay/order/entity/order.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { OsServiceService } from '../../os-service.service';

@Injectable()
export class OsServiceProductService {
  constructor(
    private readonly context: ContextService,
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
    private readonly osServiceService: OsServiceService,
  ) {}

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
