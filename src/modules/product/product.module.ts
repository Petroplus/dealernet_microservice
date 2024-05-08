import { Module } from '@nestjs/common';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
