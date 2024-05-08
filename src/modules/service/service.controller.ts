import { Controller } from '@nestjs/common';

import { ServiceService } from './service.service';

@Controller('services')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}
}
