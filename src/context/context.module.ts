import { RequestContextModule } from 'nestjs-easy-context';
import { DynamicModule, Module } from '@nestjs/common';

import { ContextService } from './context.service';

@Module({
  imports: [RequestContextModule],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: this,
    };
  }
}
