import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

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
