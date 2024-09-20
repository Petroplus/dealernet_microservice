import { Module } from '@nestjs/common';

import { OsController } from './order.controller';
import { OsService } from './order.service';
import { OsServiceModule } from './os-service/os-service.module';

@Module({
  imports: [OsServiceModule.forRoot()],
  controllers: [OsController],
  providers: [OsService],
})
export class OsModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
