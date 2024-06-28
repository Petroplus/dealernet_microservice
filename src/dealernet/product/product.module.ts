import { Module } from '@nestjs/common';

import { DealernetProductService } from './product.service';

@Module({
  providers: [DealernetProductService],
  exports: [DealernetProductService],
})
export class DealernetProductModule {}
