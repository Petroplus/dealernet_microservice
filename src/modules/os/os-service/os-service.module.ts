import { Module } from '@nestjs/common';

import { OsServiceController } from './os-service.controller';
import { OsServiceService } from './os-service.service';
import { OsServiceProductModule } from './os-service/os-service-product/os-service-product.module';

@Module({
  imports: [OsServiceProductModule],
  controllers: [OsServiceController],
  providers: [OsServiceService],
  exports: [OsServiceService],
})
export class OsServiceModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
