import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { AUTH_USER_VALIDATOR_PORT, type IAuthUserValidatorPort } from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';
import { IAuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class AuthJwtGuard implements CanActivate {
  constructor(
    @Inject(AUTH_USER_VALIDATOR_PORT)
    private readonly validator: IAuthUserValidatorPort,
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<Maybe<boolean>>(
      AuthMetadataKeyEnum.PUBLIC,
      targets,
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(/\s+/);

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(token).catch(() => {
      throw new UnauthorizedException();
    });
    const user = await this.validator.validate({ sub: payload.sub });

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;

    return true;
  }
}
