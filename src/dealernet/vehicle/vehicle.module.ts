import { Module } from '@nestjs/common';

import { DealernetVehicleService } from './vehicle.service';

@Module({
  providers: [DealernetVehicleService],
  exports: [DealernetVehicleService],
})
export class DealernetVehicleModule {}
