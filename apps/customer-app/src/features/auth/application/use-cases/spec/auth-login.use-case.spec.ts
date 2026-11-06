import { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { AuthLoginUseCase } from '../auth-login.use-case';

describe('AuthLoginUseCase', () => {
  let repository: { findByEmail: jest.Mock };
  let credentials: {
    issueAccessToken: jest.Mock;
    hashPassword: jest.Mock;
    verifyPassword: jest.Mock;
  };
  let logger: PinoLoggerMock;
  let useCase: AuthLoginUseCase;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'customer-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      }),
    };
    credentials = {
      issueAccessToken: jest.fn().mockResolvedValue('access-token'),
      hashPassword: jest.fn(),
      verifyPassword: jest.fn().mockResolvedValue(true),
    };
    logger = makePinoLoggerMock();
    useCase = new AuthLoginUseCase(repository, credentials, logger as unknown as PinoLogger);
  });

  it('issues an access token for the right password', async () => {
    const view = await useCase.execute({ email: ' Ann@Example.com ', password: 'correct-horse' });

    expect(view).toEqual({ accessToken: 'access-token' });
    expect(repository.findByEmail).toHaveBeenCalledWith('ann@example.com');
    expect(credentials.verifyPassword).toHaveBeenCalledWith({
      passwordHash: 'hash',
      password: 'correct-horse',
    });
    expect(credentials.issueAccessToken).toHaveBeenCalledWith('customer-1');
    expect(logger.info).toHaveBeenCalledWith({ customerId: 'customer-1' }, 'Customer logged in');
  });

  it('rejects an unknown email with the same error as a wrong password', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const login = useCase.execute({ email: 'ghost@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(credentials.verifyPassword).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      { email: 'ghost@example.com' },
      'Login failed: unknown email',
    );
  });

  it('rejects a wrong password', async () => {
    credentials.verifyPassword.mockResolvedValue(false);

    const login = useCase.execute({ email: 'ann@example.com', password: 'wrong-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(credentials.issueAccessToken).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      { customerId: 'customer-1' },
      'Login failed: wrong password',
    );
  });

  it('rejects a disabled customer after checking the password', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'customer-1',
      passwordHash: 'hash',
      status: UserStatusEnum.DISABLED,
    });

    const login = useCase.execute({ email: 'ann@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_USER_INACTIVE,
    });
    expect(credentials.issueAccessToken).not.toHaveBeenCalled();
  });
});
