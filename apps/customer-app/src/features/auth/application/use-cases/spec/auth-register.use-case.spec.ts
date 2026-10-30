import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { AuthDomainException } from '../../../domain';
import { AuthLedgerService } from '../../services/auth-ledger.service';
import { AuthRegisterUseCase } from '../auth-register.use-case';

describe('AuthRegisterUseCase', () => {
  let recordRegistered: jest.Mock;
  let repository: { insert: jest.Mock };
  let passwordHasher: { hash: jest.Mock; verify: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: AuthRegisterUseCase;

  beforeEach(() => {
    recordRegistered = jest.fn().mockResolvedValue(undefined);
    repository = { insert: jest.fn().mockResolvedValue(undefined) };
    passwordHasher = { hash: jest.fn().mockResolvedValue('argon-hash'), verify: jest.fn() };
    logger = makePinoLoggerMock();
    useCase = new AuthRegisterUseCase(
      { recordRegistered } as unknown as AuthLedgerService,
      repository,
      passwordHasher,
      logger as unknown as PinoLogger,
    );
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hashes the password and stores an active customer', async () => {
    const view = await useCase.execute({
      email: 'Eve@Example.com',
      password: 'correct-horse-battery',
    });

    expect(view).toEqual({
      id: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
      email: 'eve@example.com',
    });
    expect(passwordHasher.hash).toHaveBeenCalledWith('correct-horse-battery');
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
        email: 'eve@example.com',
        passwordHash: 'argon-hash',
        status: 'active',
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      { customerId: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f' },
      'Customer registered',
    );
  });

  it('rejects a weak password before hashing it', async () => {
    const register = useCase.execute({ email: 'eve@example.com', password: 'short' });

    await expect(register).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
    });
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('rejects a malformed email before storing anything', async () => {
    const register = useCase.execute({ email: 'not-an-email', password: 'correct-horse-battery' });

    await expect(register).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
    });
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('lets the taken email refusal of the repository through without logging a sign-up', async () => {
    repository.insert.mockRejectedValue(
      new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        'Email ann@example.com is already registered',
      ),
    );

    const register = useCase.execute({
      email: 'ann@example.com',
      password: 'correct-horse-battery',
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
      message: 'Email ann@example.com is already registered',
    });
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('records the registered customer in the ledger', async () => {
    await useCase.execute({ email: 'Eve@Example.com', password: 'correct-horse-battery' });

    expect(recordRegistered).toHaveBeenCalledWith({
      customerId: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
      email: 'eve@example.com',
    });
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
