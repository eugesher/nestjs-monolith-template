import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IIdentityCoreRefreshTokenCommand,
  IIdentityCoreTokenPairView,
} from '@acme-core/contracts/identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreException } from '../../domain';
import {
  IDENTITY_CORE_ACCESS_TOKEN_PORT,
  IDENTITY_CORE_REFRESH_TOKEN_REPOSITORY_PORT,
  type IIdentityCoreAccessTokenPort,
  type IIdentityCoreRefreshTokenRepositoryPort,
} from '../../outbound';
import { IdentityCoreTokenPairService } from '../services/identity-core-token-pair.service';

@Injectable()
export class IdentityCoreRefreshTokenUseCase {
  constructor(
    private readonly identityCoreTokenPair: IdentityCoreTokenPairService,
    @Inject(IDENTITY_CORE_REFRESH_TOKEN_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreRefreshTokenRepositoryPort,
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_PORT)
    private readonly accessToken: IIdentityCoreAccessTokenPort,
    @InjectPinoLogger(IdentityCoreRefreshTokenUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IIdentityCoreRefreshTokenCommand,
  ): Promise<IIdentityCoreTokenPairView> {
    const { refreshToken } = command;
    const userId = await this.accessToken.verifyRefresh(refreshToken);
    const user = userId === undefined ? undefined : await this.repository.findById(userId);

    if (!user) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_REFRESH_TOKEN_INVALID,
        'Refresh token is invalid or expired',
      );
    }

    user.assertActive();

    const permissionCodes = await this.repository.findPermissionCodes(user.id);
    const tokenPair = await this.identityCoreTokenPair.issue(user, permissionCodes);

    this.logger.info({ userId: user.id }, 'Token refreshed');

    return tokenPair;
  }
}
