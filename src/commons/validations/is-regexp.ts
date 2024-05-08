import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraintInterface,
  ValidatorConstraint,
  ValidationArguments,
  isString,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class RegExpConstraint implements ValidatorConstraintInterface {
  private regex: RegExp;

  validate(value: string, _args: ValidationArguments): boolean {
    return this.regex ? this.regex.test(value) : isString(value);
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return `$property must be a valid regular expression: ${this.regex}`;
  }

  setRegex(regexString: RegExp) {
    this.regex = new RegExp(regexString);
  }
}

export const IsRegExp = (regex: RegExp, validationOptions?: ValidationOptions) => {
  return (object: any, propertyName: string) => {
    const stringConstraint = new RegExpConstraint();
    stringConstraint.setRegex(regex);
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [object],
      validator: stringConstraint,
    });
  };
};
