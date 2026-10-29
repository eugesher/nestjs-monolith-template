import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { StaffIdentityCoreException } from '../../../domain';
import { StaffIdentityCoreRegisterUserUseCase } from '../staff-identity-core-register-user.use-case';

describe('StaffIdentityCoreRegisterUserUseCase', () => {
  let outcomes: string[];
  let repository: { insert: jest.Mock };
  let transaction: { run: jest.Mock };
  let passwordHasher: { hash: jest.Mock; verify: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: StaffIdentityCoreRegisterUserUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = { insert: jest.fn().mockResolvedValue(undefined) };
    transaction = {
      run: jest.fn(async (work: () => Promise<unknown>) => {
        outcomes.push('begin');

        const result = await work();

        outcomes.push('commit');

        return result;
      }),
    };
    passwordHasher = { hash: jest.fn().mockResolvedValue('argon-hash'), verify: jest.fn() };
    logger = makePinoLoggerMock();
    useCase = new StaffIdentityCoreRegisterUserUseCase(
      repository,
      transaction,
      passwordHasher,
      logger as unknown as PinoLogger,
    );
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hashes the password and stores the user with its roles in one transaction', async () => {
    const view = await useCase.execute({
      email: 'Editor@Example.com',
      password: 'correct-horse-battery',
      roles: [RoleEnum.EDITOR],
    });

    expect(view).toEqual({
      id: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
      email: 'editor@example.com',
    });
    expect(passwordHasher.hash).toHaveBeenCalledWith('correct-horse-battery');
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
        email: 'editor@example.com',
        passwordHash: 'argon-hash',
        roles: ['editor'],
      }),
    );
    expect(outcomes).toEqual(['begin', 'commit']);
    expect(logger.info).toHaveBeenCalledWith(
      { userId: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f' },
      'User registered',
    );
  });

  it('rejects a weak password before hashing it', async () => {
    const register = useCase.execute({ email: 'editor@example.com', password: 'short', roles: [] });

    await expect(register).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
    });
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('rejects a malformed email before opening the transaction', async () => {
    const register = useCase.execute({
      email: 'not-an-email',
      password: 'correct-horse-battery',
      roles: [],
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
    });
    expect(transaction.run).not.toHaveBeenCalled();
  });

  it('lets the taken email refusal of the repository roll the transaction back', async () => {
    repository.insert.mockRejectedValue(
      new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        'Email editor@example.com is already registered',
      ),
    );

    const register = useCase.execute({
      email: 'editor@example.com',
      password: 'correct-horse-battery',
      roles: [],
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
      message: 'Email editor@example.com is already registered',
    });
    expect(outcomes).toEqual(['begin']);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
