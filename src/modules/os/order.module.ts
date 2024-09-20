import { Module } from '@nestjs/common';

import { OsController } from './order.controller';
import { OsService } from './order.service';
import { OsServiceModule } from './os-service/os-service.module';

@Module({
  controllers: [OsController],
  providers: [OsService],
  imports: [OsServiceModule],
})
export class OsModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
