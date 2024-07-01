import { Injectable } from '@nestjs/common';
import { SwaggerEnumType } from '@nestjs/swagger/dist/types/swagger-enum.type';
import {
  isEnum,
  isInt,
  isNumberString,
  isString,
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsArrayConstraint implements ValidatorConstraintInterface {
  async validate(_value: unknown, args: ValidationArguments): Promise<boolean> {
    args.object[args.property] = Array.isArray(_value) ? _value : [_value];
    const value = args.object[args.property];

    if (!Array.isArray(value)) return false;

    const [type] = args.constraints;
    const enumOptions = (args.constraints?.slice(1) as [SwaggerEnumType]).find((x) => x);

    switch (type) {
      case 'number':
        const isNumberArray = (value as number[]).every((item) => isNumberString(item));
        return isNumberArray;
      case 'int':
        const isIntArray = (value as number[]).every((item) => isInt(Number(item)));
        return isIntArray;
      case 'string':
        const isStringArray = (value as string[]).every((item) => isString(item));
        return isStringArray;
      case 'enum':
        const isEnumArray = (value as string[]).every((item) => (enumOptions ? isEnum(item, enumOptions) : false));
        return isEnumArray;
      case 'uuid':
        const isUUIDArray = (value as string[]).every((item) => isUUID(item) && item.length == 36);
        return isUUIDArray;
      default:
        return Array.isArray(_value);
    }
  }

  defaultMessage(args?: ValidationArguments): string {
    const [type] = args.constraints;
    const enumOptions = (args.constraints?.slice(1) as [SwaggerEnumType]).find((x) => x);
    if (type === 'number') {
      return 'each value in $property must be a number';
    } else if (type === 'int') {
      return 'each value in $property must be an integer number';
    } else if (type === 'string') {
      return 'each value in $property must be a string';
    } else if (type === 'enum' && !enumOptions) {
      return 'Enum options must be provided';
    } else if (type === 'enum') {
      return `each value in $property must be one of the following values: ${Object.values(enumOptions)?.join(', ')}`;
    } else if (type === 'uuid') {
      return 'each value in $property must be a valid uuid';
    } else {
      return 'The value must be an array';
    }
  }
}

interface IsArrayOptions extends ValidationOptions {
  enum?: SwaggerEnumType;
}

type ArrayTypes = 'number' | 'int' | 'string' | 'enum' | 'uuid';

export const IsArray = (type?: ArrayTypes, validationOptions?: IsArrayOptions) => {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [type, validationOptions?.enum],
      validator: IsArrayConstraint,
    });
  };
};
