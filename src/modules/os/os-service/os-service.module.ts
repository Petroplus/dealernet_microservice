import { Module } from '@nestjs/common';
import { OsServiceService } from './os-service.service';
import { OsServiceController } from './os-service.controller';

@Module({
  controllers: [OsServiceController],
  providers: [OsServiceService],
})
export class OsServiceModule {}
