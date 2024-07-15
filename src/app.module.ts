import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule as NestjsScheduleModule } from '@nestjs/schedule';

import { ContextModule } from './context/context.module';
import { DealernetModule } from './dealernet/dealernet.module';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { AuthGuard } from './guards/auth.guard';
import { InjectRequestInterceptor } from './interceptors/inject-request.interceptor';
import { InjectTransformInterceptor } from './interceptors/inject-transform.interceptor';
import { BudgetModule } from './modules/budget/budget.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OsModule } from './modules/os/order.module';
import { ProductModule } from './modules/product/product.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ServiceModule } from './modules/service/service.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { PetroplayModule } from './petroplay/petroplay.module';
import { HttpClientModule } from './http-client/http-client.module';

@Module({
  imports: [
    NestjsScheduleModule.forRoot(),
    ContextModule.forRoot(),
    HttpClientModule.forRoot(),
    PetroplayModule.forRoot(),
    DealernetModule.forRoot(),
    ScheduleModule.forRoot(),
    CustomerModule.forRoot(),
    VehicleModule.forRoot(),
    ProductModule.forRoot(),
    ServiceModule.forRoot(),
    OsModule.forRoot(),
    BudgetModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
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
