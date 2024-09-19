import { Module } from '@nestjs/common';

import { OsModule } from '../os/order.module';
import { OsService } from '../os/order.service';

import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService, OsService],
})
export class BudgetModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
