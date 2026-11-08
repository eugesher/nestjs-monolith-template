import { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { UserRegisterUseCase } from '../user-register.use-case';

describe('UserRegisterUseCase', () => {
  let outcomes: string[];
  let repository: { insertUser: jest.Mock; findRoles: jest.Mock; insertUserRoles: jest.Mock };
  let transaction: { run: jest.Mock; afterCommit: jest.Mock };
  let credentials: { hashPassword: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: UserRegisterUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      insertUser: jest.fn(() => {
        outcomes.push('insert');

        return Promise.resolve('5');
      }),
      findRoles: jest.fn().mockResolvedValue([{ id: '2' }]),
      insertUserRoles: jest.fn().mockResolvedValue(undefined),
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
    credentials = { hashPassword: jest.fn().mockResolvedValue('argon-hash') };
    logger = makePinoLoggerMock();
    useCase = new UserRegisterUseCase(
      repository,
      transaction,
      credentials,
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hashes the password and stores the user with its roles in one transaction', async () => {
    const view = await useCase.execute({
      email: 'Editor@Example.com',
      password: 'correct-horse-battery',
      roleIds: ['2'],
    });

    expect(view).toEqual({ id: '5', email: 'editor@example.com' });
    expect(credentials.hashPassword).toHaveBeenCalledWith('correct-horse-battery');
    expect(repository.insertUser).toHaveBeenCalledWith({
      email: 'editor@example.com',
      passwordHash: 'argon-hash',
      status: 'active',
    });
    expect(repository.findRoles).toHaveBeenCalledWith(['2']);
    expect(repository.insertUserRoles).toHaveBeenCalledWith([{ userId: '5', roleId: '2' }]);
    expect(outcomes).toEqual(['begin', 'insert', 'commit']);
    expect(logger.info).toHaveBeenCalledWith({ userId: '5' }, 'User registered');
  });

  it('refuses a role that is not stored and rolls the transaction back', async () => {
    const register = useCase.execute({
      email: 'editor@example.com',
      password: 'correct-horse-battery',
      roleIds: ['2', '99'],
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role 99 was not found',
    });
    expect(repository.insertUserRoles).not.toHaveBeenCalled();
    expect(outcomes).not.toContain('commit');
  });

  it('rejects a weak password before hashing it', async () => {
    const register = useCase.execute({
      email: 'editor@example.com',
      password: 'short',
      roleIds: [],
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK,
    });
    expect(credentials.hashPassword).not.toHaveBeenCalled();
  });

  it('rejects a malformed email before opening the transaction', async () => {
    const register = useCase.execute({
      email: 'not-an-email',
      password: 'correct-horse-battery',
      roleIds: [],
    });

    await expect(register).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID,
    });
    expect(transaction.run).not.toHaveBeenCalled();
  });

  it(
    'refuses a duplicate email of the repository ' + 'as taken and rolls the transaction back',
    async () => {
      repository.insertUser.mockRejectedValue(new Error('Duplicate entry'));
      jest.spyOn(MysqlErrorHelper, 'isDuplicateKey').mockReturnValue(true);

      const register = useCase.execute({
        email: 'editor@example.com',
        password: 'correct-horse-battery',
        roleIds: [],
      });

      await expect(register).rejects.toMatchObject({
        code: IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN,
        message: 'Email editor@example.com is already registered',
      });
      expect(outcomes).toEqual(['begin']);
      expect(logger.info).not.toHaveBeenCalled();
    },
  );

  it('passes a failing insert through as is and rolls the transaction back', async () => {
    repository.insertUser.mockRejectedValue(new Error('deadlock'));

    const register = useCase.execute({
      email: 'editor@example.com',
      password: 'correct-horse-battery',
      roleIds: [],
    });

    await expect(register).rejects.toThrow('deadlock');
    expect(outcomes).toEqual(['begin']);
  });
});
