import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ScheduleFilter } from './filters/schedule.filters';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dialernet: DealernetService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sync(filter: ScheduleFilter): Promise<void> {
    const integration = await this.petroplay.integration.find({ clients: filter.client_ids });
    if (!integration) throw new BadRequestException('Integration not found');
  }
}
