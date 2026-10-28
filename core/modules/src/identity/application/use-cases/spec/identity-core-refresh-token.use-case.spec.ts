import { PinoLogger } from 'nestjs-pino';

import {
  IdentityErrorCodeEnum,
  PermissionCodeEnum,
  RoleEnum,
  UserStatusEnum,
} from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { IdentityCoreUserModel } from '../../../domain';
import { IdentityCoreTokenPairService } from '../../services/identity-core-token-pair.service';
import { IdentityCoreRefreshTokenUseCase } from '../identity-core-refresh-token.use-case';

describe('IdentityCoreRefreshTokenUseCase', () => {
  let issue: jest.Mock;
  let repository: { findById: jest.Mock; findPermissionCodes: jest.Mock };
  let accessToken: { signAccess: jest.Mock; signRefresh: jest.Mock; verifyRefresh: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: IdentityCoreRefreshTokenUseCase;

  beforeEach(() => {
    issue = jest.fn().mockResolvedValue({ accessToken: 'access-2', refreshToken: 'refresh-2' });
    repository = {
      findById: jest.fn().mockResolvedValue(
        IdentityCoreUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
      findPermissionCodes: jest.fn().mockResolvedValue([PermissionCodeEnum.NOTE_READ]),
    };
    accessToken = {
      signAccess: jest.fn(),
      signRefresh: jest.fn(),
      verifyRefresh: jest.fn().mockResolvedValue('user-1'),
    };
    logger = makePinoLoggerMock();
    useCase = new IdentityCoreRefreshTokenUseCase(
      { issue } as unknown as IdentityCoreTokenPairService,
      repository,
      accessToken,
      logger as unknown as PinoLogger,
    );
  });

  it('issues a new pair for the subject of a valid refresh token', async () => {
    const pair = await useCase.execute({ refreshToken: 'refresh-1' });

    expect(pair).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-2' });
    expect(accessToken.verifyRefresh).toHaveBeenCalledWith('refresh-1');
    expect(repository.findById).toHaveBeenCalledWith('user-1');
    expect(issue).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }), ['note:read']);
    expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1' }, 'Token refreshed');
  });

  it('rejects an invalid refresh token without reading the user', async () => {
    accessToken.verifyRefresh.mockResolvedValue(undefined);

    const refresh = useCase.execute({ refreshToken: 'forged' });

    await expect(refresh).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_REFRESH_TOKEN_INVALID,
      message: 'Refresh token is invalid or expired',
    });
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('rejects the token of a deleted user', async () => {
    repository.findById.mockResolvedValue(undefined);

    const refresh = useCase.execute({ refreshToken: 'refresh-1' });

    await expect(refresh).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_REFRESH_TOKEN_INVALID,
    });
  });

  it('rejects the token of a disabled user', async () => {
    repository.findById.mockResolvedValue(
      IdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [],
      }),
    );

    const refresh = useCase.execute({ refreshToken: 'refresh-1' });

    await expect(refresh).rejects.toMatchObject({ code: IdentityErrorCodeEnum.AUTH_USER_INACTIVE });
    expect(issue).not.toHaveBeenCalled();
  });
});
