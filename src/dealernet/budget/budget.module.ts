import { Module } from '@nestjs/common';

import { DealernetBudgetService } from './budget.service';

@Module({
  providers: [DealernetBudgetService],
  exports: [DealernetBudgetService],
})
export class DealernetBudgetModule {}
