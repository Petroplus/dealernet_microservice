import { DynamicModule, Module } from '@nestjs/common';

import { DealernetBudgetModule } from './budget/budget.module';
import { DealernetCustomerModule } from './customer/customer.module';
import { DealernetService } from './dealernet.service';
import { DealernetOrderModule } from './order/order.module';
import { DealernetProductModule } from './product/product.module';
import { DealernetScheduleModule } from './schedule/schedule.module';
import { DealernetServiceModule } from './service/service.module';
import { DealernetVehicleModule } from './vehicle/vehicle.module';
import { DealernetVehicleModelModule } from './vehicle-model/vehicle-model.module';

@Module({
  imports: [
    DealernetScheduleModule.forRoot(),
    DealernetCustomerModule,
    DealernetVehicleModule,
    DealernetVehicleModelModule,
    DealernetOrderModule,
    DealernetProductModule,
    DealernetServiceModule,
    DealernetBudgetModule,
  ],
  providers: [DealernetService],
  exports: [DealernetService],
})
export class DealernetModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DealernetModule,
    };
  }
}
