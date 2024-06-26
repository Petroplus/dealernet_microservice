import { Request } from 'express';

import { UserResponse } from './petroplay/responses/user.response';

interface LoggedRequest extends Request {
  token?: string;
  user?: UserResponse;
  clients?: string[];
}

interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_CONTEXT]: {
      user: UserEntity;
      params: DynamicObject;
    };
  };
}
