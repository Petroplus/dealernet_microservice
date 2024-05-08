import { BadRequestException, ValidationError } from '@nestjs/common';

export const ErrorFormatter = (errors: ValidationError[], errMessage?: any, parentField?: string) => {
  const message = errMessage ?? {};

  errors.forEach((error) => {
    const errorField = (parentField ? `${parentField}.${error.property}` : error?.property).replaceAll(/\.\d+/g, '');
    if (!error?.constraints && error?.children?.length) {
      ErrorFormatter(error.children, message, errorField);
    } else {
      const validationsList = Object.values(error?.constraints);
      if (!message[errorField]) message[errorField] = validationsList;
      else if (!message[errorField].includes(validationsList[0])) message[errorField].push(validationsList[0]);
    }
  });

  return message;
};

export const ValidationExceptionFactory = (validationErrors: ValidationError[]) => {
  const message = ErrorFormatter(validationErrors);

  throw new BadRequestException([message]);
};
