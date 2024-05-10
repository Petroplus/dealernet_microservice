import { Module } from '@nestjs/common';

import { DealernetVehicleModelService } from './vehicle-model.service';

@Module({
  providers: [DealernetVehicleModelService],
  exports: [DealernetVehicleModelService],
})
export class DealernetVehicleModelModule {}
