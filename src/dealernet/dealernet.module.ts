import { Module, DynamicModule } from '@nestjs/common';

import { DealernetService } from './dealernet.service';
import { DealernetScheduleModule } from './schedule/schedule.module';
import { DealernetCustomerModule } from './customer/customer.module';
import { DealernetVehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [DealernetScheduleModule.forRoot(), DealernetCustomerModule, DealernetVehicleModule],
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
