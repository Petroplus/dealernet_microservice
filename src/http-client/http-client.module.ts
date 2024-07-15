import { DynamicModule, Module } from '@nestjs/common';

import { HttpClientService } from './http-client.service';

@Module({
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: this,
    };
  }
}
