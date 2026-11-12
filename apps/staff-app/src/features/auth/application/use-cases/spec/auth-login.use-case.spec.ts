import type { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { AuthLoginUseCase } from '../auth-login.use-case';

describe('AuthLoginUseCase', () => {
  let identity: { findSubject: jest.Mock; findByEmail: jest.Mock };
  let credentials: { issueAccessToken: jest.Mock; verifyPassword: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: AuthLoginUseCase;

  beforeEach(() => {
    identity = {
      findSubject: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      }),
    };
    credentials = {
      issueAccessToken: jest.fn().mockResolvedValue('access-token'),
      verifyPassword: jest.fn().mockResolvedValue(true),
    };
    logger = makePinoLoggerMock();
    useCase = new AuthLoginUseCase(identity, credentials, logger as unknown as PinoLogger);
  });

  it('issues an access token for the right password', async () => {
    const view = await useCase.execute({
      email: ' Editor@Example.com ',
      password: 'correct-horse',
    });

    expect(view).toEqual({ accessToken: 'access-token' });
    expect(identity.findByEmail).toHaveBeenCalledWith({ email: 'editor@example.com' });
    expect(credentials.verifyPassword).toHaveBeenCalledWith({
      passwordHash: 'hash',
      password: 'correct-horse',
    });
    expect(credentials.issueAccessToken).toHaveBeenCalledWith('user-1');
    expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1' }, 'User logged in');
  });

  it('rejects an unknown email after the same password check and with the same error as a wrong password', async () => {
    identity.findByEmail.mockResolvedValue(null);

    const login = useCase.execute({ email: 'ghost@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(credentials.verifyPassword).toHaveBeenCalledWith({
      passwordHash: null,
      password: 'correct-horse',
    });
    expect(logger.warn).toHaveBeenCalledWith(
      { email: 'ghost@example.com' },
      'Login failed: unknown email',
    );
  });

  it('rejects a wrong password', async () => {
    credentials.verifyPassword.mockResolvedValue(false);

    const login = useCase.execute({ email: 'editor@example.com', password: 'wrong-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(credentials.issueAccessToken).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({ userId: 'user-1' }, 'Login failed: wrong password');
  });

  it('rejects a disabled user after checking the password', async () => {
    identity.findByEmail.mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash',
      status: UserStatusEnum.DISABLED,
    });

    const login = useCase.execute({ email: 'editor@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_USER_INACTIVE,
    });
    expect(credentials.issueAccessToken).not.toHaveBeenCalled();
  });
});
