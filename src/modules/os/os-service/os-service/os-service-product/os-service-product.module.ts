import { Module } from '@nestjs/common';
import { OsServiceProductService } from './os-service-product.service';
import { OsServiceProductController } from './os-service-product.controller';

@Module({
  controllers: [OsServiceProductController],
  providers: [OsServiceProductService],
})
export class OsServiceProductModule {}
