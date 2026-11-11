import type { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, PermissionCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { RoleCreateStaffRoleInsertOutcomeEnum } from '../../../outbound';
import { RoleCreateUseCase } from '../role-create.use-case';

describe('RoleCreateUseCase', () => {
  let outcomes: string[];
  let repository: { insertRole: jest.Mock; insertRolePermissions: jest.Mock };
  let transaction: { run: jest.Mock; afterCommit: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: RoleCreateUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      insertRole: jest
        .fn()
        .mockResolvedValue({ outcome: RoleCreateStaffRoleInsertOutcomeEnum.INSERTED, id: '7' }),
      insertRolePermissions: jest.fn().mockResolvedValue(undefined),
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
    logger = makePinoLoggerMock();
    useCase = new RoleCreateUseCase(repository, transaction, logger as unknown as PinoLogger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores the role with its unique permission codes in one transaction', async () => {
    const view = await useCase.execute({
      name: 'auditor',
      permissionCodes: [
        PermissionCodeEnum.LEDGER_READ,
        PermissionCodeEnum.ORDER_READ,
        PermissionCodeEnum.LEDGER_READ,
      ],
    });

    expect(view).toEqual({
      id: '7',
      name: 'auditor',
      permissionCodes: ['ledger:read', 'order:read'],
    });
    expect(repository.insertRole).toHaveBeenCalledWith({ name: 'auditor' });
    expect(repository.insertRolePermissions).toHaveBeenCalledWith([
      { roleId: '7', code: 'ledger:read' },
      { roleId: '7', code: 'order:read' },
    ]);
    expect(outcomes).toEqual(['begin', 'commit']);
    expect(logger.info).toHaveBeenCalledWith({ roleId: '7' }, 'Role created');
  });

  it('stores a role without permissions', async () => {
    const view = await useCase.execute({ name: 'auditor', permissionCodes: [] });

    expect(view).toEqual({ id: '7', name: 'auditor', permissionCodes: [] });
    expect(repository.insertRolePermissions).toHaveBeenCalledWith([]);
  });

  it('refuses a taken name and rolls the transaction back', async () => {
    repository.insertRole.mockResolvedValue({
      outcome: RoleCreateStaffRoleInsertOutcomeEnum.DUPLICATE,
    });

    const create = useCase.execute({ name: 'admin', permissionCodes: [] });

    await expect(create).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NAME_TAKEN,
      message: 'Role name admin is already taken',
    });
    expect(outcomes).toEqual(['begin']);
  });

  it('rethrows any other error of the repository', async () => {
    const failure = new Error('connection lost');
    repository.insertRole.mockRejectedValue(failure);

    const create = useCase.execute({ name: 'auditor', permissionCodes: [] });

    await expect(create).rejects.toBe(failure);
  });
});
