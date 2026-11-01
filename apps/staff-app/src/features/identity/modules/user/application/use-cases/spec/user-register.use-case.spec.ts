import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { UserDomainException, UserStaffUserModel } from '../../../domain';
import { UserRegisterUseCase } from '../user-register.use-case';

describe('UserRegisterUseCase', () => {
  let outcomes: string[];
  let repository: { insert: jest.Mock };
  let transaction: { run: jest.Mock; afterCommit: jest.Mock };
  let passwordHasher: { hash: jest.Mock; verify: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: UserRegisterUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      insert: jest.fn(() => {
        outcomes.push('insert');

        const user = UserStaffUserModel.reconstitute({
          id: '5',
          email: 'editor@example.com',
          passwordHash: 'argon-hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        });

        return Promise.resolve(user);
      }),
    };
    transaction = {
      afterCommit: jest.fn(),
      run: jest.fn(async (work: () => Promise<unknown>) => {
        outcomes.push('begin');

        const result = await work();

        outcomes.push('commit');

        return result;
      }),
    };
    passwordHasher = { hash: jest.fn().mockResolvedValue('argon-hash'), verify: jest.fn() };
    logger = makePinoLoggerMock();
    useCase = new UserRegisterUseCase(
      repository,
      transaction,
      passwordHasher,
      logger as unknown as PinoLogger,
    );
  });

  it('hashes the password and stores the user with its roles in one transaction', async () => {
    const view = await useCase.execute({
      email: 'Editor@Example.com',
      password: 'correct-horse-battery',
      roles: [RoleEnum.EDITOR],
    });

    expect(view).toEqual({ id: '5', email: 'editor@example.com' });
    expect(passwordHasher.hash).toHaveBeenCalledWith('correct-horse-battery');
    expect(repository.insert).toHaveBeenCalledWith({
      email: 'editor@example.com',
      passwordHash: 'argon-hash',
      status: 'active',
      roles: ['editor'],
    });
    expect(outcomes).toEqual(['begin', 'insert', 'commit']);
    expect(logger.info).toHaveBeenCalledWith({ userId: '5' }, 'User registered');
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
      new UserDomainException(
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
