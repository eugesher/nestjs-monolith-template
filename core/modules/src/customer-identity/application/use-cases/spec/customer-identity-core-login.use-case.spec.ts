import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { CustomerIdentityCoreCustomerModel } from '../../../domain';
import { CustomerIdentityCoreAccessTokenService } from '../../services/customer-identity-core-access-token.service';
import { CustomerIdentityCoreLoginUseCase } from '../customer-identity-core-login.use-case';

describe('CustomerIdentityCoreLoginUseCase', () => {
  let issue: jest.Mock;
  let repository: { findByEmail: jest.Mock };
  let passwordHasher: { hash: jest.Mock; verify: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: CustomerIdentityCoreLoginUseCase;

  beforeEach(() => {
    issue = jest.fn().mockResolvedValue({ accessToken: 'access-token' });
    repository = {
      findByEmail: jest.fn().mockResolvedValue(
        CustomerIdentityCoreCustomerModel.reconstitute({
          id: 'customer-1',
          email: 'ann@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
        }),
      ),
    };
    passwordHasher = { hash: jest.fn(), verify: jest.fn().mockResolvedValue(true) };
    logger = makePinoLoggerMock();
    useCase = new CustomerIdentityCoreLoginUseCase(
      { issue } as unknown as CustomerIdentityCoreAccessTokenService,
      repository,
      passwordHasher,
      logger as unknown as PinoLogger,
    );
  });

  it('issues an access token for the right password', async () => {
    const view = await useCase.execute({ email: ' Ann@Example.com ', password: 'correct-horse' });

    expect(view).toEqual({ accessToken: 'access-token' });
    expect(repository.findByEmail).toHaveBeenCalledWith('ann@example.com');
    expect(passwordHasher.verify).toHaveBeenCalledWith('hash', 'correct-horse');
    expect(issue).toHaveBeenCalledWith(expect.objectContaining({ id: 'customer-1' }));
    expect(logger.info).toHaveBeenCalledWith({ customerId: 'customer-1' }, 'Customer logged in');
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

    const login = useCase.execute({ email: 'ann@example.com', password: 'wrong-horse' });

    await expect(login).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
    expect(issue).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      { customerId: 'customer-1' },
      'Login failed: wrong password',
    );
  });

  it('rejects a disabled customer after checking the password', async () => {
    repository.findByEmail.mockResolvedValue(
      CustomerIdentityCoreCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      }),
    );

    const login = useCase.execute({ email: 'ann@example.com', password: 'correct-horse' });

    await expect(login).rejects.toMatchObject({ code: IdentityErrorCodeEnum.AUTH_USER_INACTIVE });
    expect(issue).not.toHaveBeenCalled();
  });
});
