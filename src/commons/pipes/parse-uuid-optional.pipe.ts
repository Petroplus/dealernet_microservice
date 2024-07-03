import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ParseUUIDOptionalPipe implements PipeTransform {
  async transform(value: string) {
    if (value && !isUUID(value)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }

    return value;
  }
}
