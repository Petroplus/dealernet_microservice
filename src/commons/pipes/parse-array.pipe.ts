import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseArrayOptions,
  PipeTransform,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

import { ValidationExceptionFactory } from 'src/exceptions/validations.exception';

import { validateDto } from '../validations/validate-dto';

interface ExtendedOptions extends ParseArrayOptions {
  allowEmpty?: boolean;
  maxLength?: number;
  type?: Type<any>;
}

@Injectable()
export class ParseArrayPipe<T> implements PipeTransform {
  constructor(private type?: ClassConstructor<T> | ExtendedOptions) {}

  async transform(values: Type<T>[], metadata: ArgumentMetadata): Promise<T[]> {
    const type = this.getType();

    if (!type) {
      throw new BadRequestException('Validation failed (array type is not defined)');
    }

    const _values = Array.isArray(values) ? values : [values];

    if (_values.length == 0 && !this.allowEmpty()) {
      throw new BadRequestException('Validation failed (array should not be empty)');
    }

    if (_values.length > this.maxLength()) {
      throw new BadRequestException(`Validation failed (max items is ${this.maxLength()})`);
    }

    const validate = new ValidationPipe({ transform: true, whitelist: true });

    const errors = await validateDto(type, _values);
    if (errors.length > 0) return ValidationExceptionFactory(errors);

    return Promise.all(_values.map((value) => validate.transform(value, { ...metadata, metatype: type })));
  }

  private getType(): ClassConstructor<T> | undefined {
    return this.type instanceof Function ? this.type : ((this.type?.items ?? this.type?.type) as Type<T>);
  }

  private allowEmpty(): boolean {
    return this.type instanceof Object && (this.type as ExtendedOptions).allowEmpty === true;
  }

  private maxLength(): number {
    return this.type instanceof Object ? (this.type as ExtendedOptions).maxLength : 999;
  }
}
