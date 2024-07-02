import { Module } from '@nestjs/common';

import { OsController } from './order.controller';
import { OsService } from './order.service';

@Module({
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
