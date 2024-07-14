import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class ParseOrderPipe implements PipeTransform {
  constructor(private petroplay: PetroplayService) {}

  async transform(value: string) {
    if (!isUUID(value)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }

    const order = await this.petroplay.order.findById(value);
    if (!order) {
      throw new BadRequestException(`Validation failed (Order with id ${value} not found)`);
    }

    return value;
  }
}
