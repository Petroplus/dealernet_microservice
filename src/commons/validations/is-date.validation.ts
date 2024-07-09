import {
  isDateString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class DateConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    if (!isDateString(value) || isNaN(Date.parse(value))) return false;

    _args.object[_args.property] = new Date(value);
    return true;
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'Property must be a valid date';
  }
}

export const IsDateString = (validationOptions?: ValidationOptions) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [object],
      validator: new DateConstraint(),
    });
  };
};
