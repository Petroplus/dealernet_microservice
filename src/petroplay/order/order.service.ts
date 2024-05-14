import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { petroplay } from 'src/commons/web-client';
import { PetroplayOrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-items.entity';
import { OrderStatus } from './enum/order-status.enum';

@Injectable()
export class PetroplayOrderService {
  async import(order: any): Promise<void> {
    const client = await petroplay.v1();
    await client.post('/v1/orders/import', order).catch((err) => {
      Logger.error('Error on import order:', err, 'PetroplayOrderService.import');
      throw new BadRequestException('Error on import order');
    });
  }

  async findById(order_id: string): Promise<PetroplayOrderEntity> {
    const client = await petroplay.v1();
    return await client
      .get(`/v1/orders/${order_id}`)
      .then(({ data }) => data)
      .catch((err) => {
        Logger.error('Error on find order:', err, 'PetroplayOrderService.findById');
        throw new BadRequestException('Error on find order');
      });
  }

  async findItems(order_id: string): Promise<OrderItemEntity[]> {
    const client = await petroplay.v2();
    return await client
      .get(`/v2/orders/${order_id}/items?expand=service&expand=service.items&expand=products&expand=products.product`)
      .then(({ data }) => data)
      .catch((err) => {
        Logger.error('Error on find order items:', err, 'PetroplayOrderService.findItems');
        throw new BadRequestException('Error on find order items');
      });
  }

  async updateStatus(order_id: string, status: OrderStatus): Promise<OrderItemEntity> {
    const client = await petroplay.v1();
    return client
      .put(`/v1/orders/${order_id}/status`, { status })
      .then(({ data }) => data)
      .catch((err) => {
        Logger.error('Error on update order status:', err, 'PetroplayOrderService.updateStatus');
        throw new BadRequestException('Error on update order status');
      });
  }
}
