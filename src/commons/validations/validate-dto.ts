import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';

export async function validateDto<T, V>(
  cls: ClassConstructor<T>,
  object: V | V[],
  options?: ValidatorOptions,
): Promise<ValidationError[]> {
  if (Array.isArray(object)) {
    const results = await Promise.all(object.map((o) => validateDto(cls, o, options)));
    return results.flat();
  } else {
    return validate(plainToClass(cls, object) as any, options);
  }
}
