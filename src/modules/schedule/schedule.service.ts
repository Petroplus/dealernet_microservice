import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { IntegrationResponse } from 'src/petroplay/integration/entities/integration.entity';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ScheduleFilter } from './filters/schedule.filters';
import { DealernetSchedule } from 'src/dealernet/schedule/response/schedule-response';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dialernet: DealernetService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sync(filter: ScheduleFilter): Promise<void> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');
  }

  async schema(filter: ScheduleFilter): Promise<unknown> {
    const integrations = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integrations) throw new BadRequestException('Integration not found');

    const orders = [];
    for await (const integration of integrations) {
      const schedules = await this.dialernet.schedule.find(integration.dealernet, filter.start_date, filter.end_date);
      orders.push(await this.scheduleToOs(integration, schedules));
    }

    return orders;
  }

  async scheduleToOs(integration: IntegrationResponse, schedules: DealernetSchedule[]): Promise<unknown> {
    return;
  }
}
