import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule as NestjsScheduleModule } from '@nestjs/schedule';

import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { InjectRequestInterceptor } from './interceptors/inject-request.interceptor';
import { InjectTransformInterceptor } from './interceptors/inject-transform.interceptor';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { CustomerModule } from './modules/customer/customer.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ProductModule } from './modules/product/product.module';
import { ServiceModule } from './modules/service/service.module';

@Module({
  imports: [
    NestjsScheduleModule.forRoot(),
    ScheduleModule.forRoot(),
    CustomerModule.forRoot(),
    VehicleModule.forRoot(),
    ProductModule.forRoot(),
    ServiceModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InjectRequestInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InjectTransformInterceptor,
    },
  ],
})
export class AppModule {}
