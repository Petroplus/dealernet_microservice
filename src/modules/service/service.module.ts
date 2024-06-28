import { Module } from '@nestjs/common';

import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
