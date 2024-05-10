import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { petroplay } from 'src/commons/web-client';

@Injectable()
export class PetroplayOrderService {
  async import(order: any): Promise<void> {
    const client = await petroplay.v1();
    await client.post('/v1/orders/import', order).catch((err) => {
      Logger.error('Error on import order:', err, 'PetroplayOrderService.import');
      throw new BadRequestException('Error on import order');
    });
  }
}
