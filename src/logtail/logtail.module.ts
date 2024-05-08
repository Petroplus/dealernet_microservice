import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class LogtailModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: this,
    };
  }
}
