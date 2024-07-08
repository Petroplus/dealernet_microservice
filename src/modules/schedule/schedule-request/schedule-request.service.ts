import { BadRequestException, Injectable } from '@nestjs/common';

import { ContextService } from 'src/context/context.service';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { UpsertScheduleServiceDto } from 'src/dealernet/schedule/dto/upsert-schedule';
import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class ScheduleRequestService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
    private readonly context: ContextService,
  ) {}

  async upsert(order_id: string): Promise<unknown> {
    const order = await this.petroplay.order.findById(order_id);
    if (!order) throw new BadRequestException('Order not found');

    const integration = await this.petroplay.integration.findByClientId(order.client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const schedule = await this.dealernet.schedule
      .find(integration.dealernet, { schedule_id: order.integration_id })
      .then((data) => data.first());

    const requests = await this.petroplay.order.findOrderCustomerRequests(order_id);

    const services: UpsertScheduleServiceDto[] = [];
    for await (const request of requests) {
      request.services.forEach((service) => {
        services.push({
          TMOReferencia: service.integration_id,
          Tempo: service.quantity,
          Quantidade: 1,
          ValorUnitario: service.price,
          TipoOSSigla: 'RV',
        });
      });
    }

    await this.dealernet.schedule.upsert(integration.dealernet, { ...schedule, Servicos: services } as any);
    return schedule;
  }
}
