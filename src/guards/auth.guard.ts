import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { LoggedRequest } from 'src';

import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private petroplay: PetroplayService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = Object.keys(request.headers).find((h) => h.toLowerCase() === 'authorization');

    if (!authHeader) {
      return true;
    }

    const secretKey = this.getSecretKeyFromRequest(request);

    if (secretKey) {
      return this.petroplay.findMeBySecretKey(secretKey).then(async (user) => {
        if (!user) throw new UnauthorizedException('User not found');
        if (!user.role) throw new UnauthorizedException('User has no role');
        if (user.status != 'ACTV') throw new UnauthorizedException('User is not active');

        request.user = user;
        return true;
      });
    }

    request.token = this.getTokenFromRequest(request);

    if (!request.token) {
      throw new UnauthorizedException('Invalid or not provided auth token');
    }

    return this.petroplay.findMeByBearer(request.token).then(async (user) => {
      if (!user) throw new UnauthorizedException('User not found');
      if (!user.role) throw new UnauthorizedException('User has no role');
      if (user.status != 'ACTV') throw new UnauthorizedException('User is not active');

      request.user = user;
      return true;
    });
  }

  private getSecretKeyFromRequest(request: LoggedRequest): string {
    const authHeader = Object.keys(request.headers).find(
      (h) => h.toLowerCase() === 'x-secret-key' || h.toLowerCase() === 'x-api-key',
    );

    if (!authHeader) return null;

    const secretKey = request.headers[authHeader] as string;

    return secretKey;
  }

  private getTokenFromRequest(request: LoggedRequest): string {
    const authHeader = Object.keys(request.headers).find((h) => h.toLowerCase() === 'authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Token is not present');
    }

    const authorization = request.headers[authHeader] as string;

    const authParts = authorization.split(' ');
    if (authParts[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Bearer is not present');
    }

    return authParts[1] as string;
  }
}
