import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
