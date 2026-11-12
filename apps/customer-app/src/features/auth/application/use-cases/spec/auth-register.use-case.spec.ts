import type { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { AuthRegisterCustomerInsertOutcomeEnum } from '../../../outbound';
import { AuthRegisterUseCase } from '../auth-register.use-case';

describe('AuthRegisterUseCase', () => {
  let recordRegistered: jest.Mock;
  let repository: { insert: jest.Mock };
  let credentials: {
    issueAccessToken: jest.Mock;
    hashPassword: jest.Mock;
    verifyPassword: jest.Mock;
  };
  let logger: PinoLoggerMock;
  let useCase: AuthRegisterUseCase;

  beforeEach(() => {
    recordRegistered = jest.fn().mockResolvedValue(undefined);
    repository = {
      insert: jest
        .fn()
        .mockResolvedValue({ outcome: AuthRegisterCustomerInsertOutcomeEnum.INSERTED, id: '105' }),
    };
    credentials = {
      issueAccessToken: jest.fn(),
      hashPassword: jest.fn().mockResolvedValue('argon-hash'),
      verifyPassword: jest.fn(),
    };
    logger = makePinoLoggerMock();
    useCase = new AuthRegisterUseCase(
      repository,
      credentials,
      { recordRegistered },
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hashes the password and stores an active customer', async () => {
    const view = await useCase.execute({
      email: 'Eve@Example.com',
      password: 'correct-horse-battery',
    });

    expect(view).toEqual({ id: '105', email: 'eve@example.com' });
    expect(credentials.hashPassword).toHaveBeenCalledWith('correct-horse-battery');
    expect(repository.insert).toHaveBeenCalledWith({
      email: 'eve@example.com',
      passwordHash: 'argon-hash',
      status: 'active',
    });
    expect(logger.info).toHaveBeenCalledWith({ customerId: '105' }, 'Customer registered');
  });

  it('rejects a weak password before hashing it', async () => {
    const register = useCase.execute({ email: 'eve@example.com', password: 'short' });

    await expect(register).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK,
    });
    expect(credentials.hashPassword).not.toHaveBeenCalled();
  });

  it('rejects a malformed email before storing anything', async () => {
    const register = useCase.execute({ email: 'not-an-email', password: 'correct-horse-battery' });

    await expect(register).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID,
    });
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('refuses a duplicate email of the repository as taken without logging a sign-up', async () => {
    repository.insert.mockResolvedValue({
      outcome: AuthRegisterCustomerInsertOutcomeEnum.DUPLICATE,
    });

    const register = useCase.execute({
      email: 'ann@example.com',
      password: 'correct-horse-battery',
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN,
      message: 'Email is already registered',
    });
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('records the registered customer in the ledger', async () => {
    await useCase.execute({ email: 'Eve@Example.com', password: 'correct-horse-battery' });

    expect(recordRegistered).toHaveBeenCalledWith({ customerId: '105' });
  });

  it('records nothing when the customer is refused', async () => {
    repository.insert.mockRejectedValue(new Error('Email eve@example.com is already registered'));

    const execution = useCase.execute({
      email: 'eve@example.com',
      password: 'correct-horse-battery',
    });

    await expect(execution).rejects.toThrow('Email eve@example.com is already registered');
    expect(recordRegistered).not.toHaveBeenCalled();
  });
});
