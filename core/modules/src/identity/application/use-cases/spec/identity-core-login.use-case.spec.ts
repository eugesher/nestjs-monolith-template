import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { IdentityCoreUserModel } from '../../../domain';
import { IdentityCoreAccessTokenService } from '../../services/identity-core-access-token.service';
import { IdentityCoreLoginUseCase } from '../identity-core-login.use-case';

describe('IdentityCoreLoginUseCase', () => {
  let issue: jest.Mock;
  let repository: { findByEmail: jest.Mock };
  let passwordHasher: { hash: jest.Mock; verify: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: IdentityCoreLoginUseCase;

  beforeEach(() => {
    issue = jest.fn().mockResolvedValue({ accessToken: 'access-token' });
    repository = {
      findByEmail: jest.fn().mockResolvedValue(
        IdentityCoreUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
    };
    passwordHasher = { hash: jest.fn(), verify: jest.fn().mockResolvedValue(true) };
    logger = makePinoLoggerMock();
    useCase = new IdentityCoreLoginUseCase(
      { issue } as unknown as IdentityCoreAccessTokenService,
      repository,
      passwordHasher,
      logger as unknown as PinoLogger,
    );
  });

  it('issues an access token for the right password', async () => {
    const view = await useCase.execute({
      email: ' Editor@Example.com ',
      password: 'correct-horse',
    });

    expect(view).toEqual({ accessToken: 'access-token' });
    expect(repository.findByEmail).toHaveBeenCalledWith('editor@example.com');
    expect(passwordHasher.verify).toHaveBeenCalledWith('hash', 'correct-horse');
    expect(issue).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1' }, 'User logged in');
  });

  it('rejects an unknown email with the same error as a wrong password', async () => {
    repository.findByEmail.mockResolvedValue(undefined);

    const login = useCase.execute({ email: 'ghost@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(passwordHasher.verify).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      { email: 'ghost@example.com' },
      'Login failed: unknown email',
    );
  });

  it('rejects a wrong password', async () => {
    passwordHasher.verify.mockResolvedValue(false);

    const login = useCase.execute({ email: 'editor@example.com', password: 'wrong-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(issue).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({ userId: 'user-1' }, 'Login failed: wrong password');
  });

  it('rejects a disabled user after checking the password', async () => {
    repository.findByEmail.mockResolvedValue(
      IdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [],
      }),
    );

    const login = useCase.execute({ email: 'editor@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({ code: IdentityErrorCodeEnum.AUTH_USER_INACTIVE });
    expect(issue).not.toHaveBeenCalled();
  });
});
