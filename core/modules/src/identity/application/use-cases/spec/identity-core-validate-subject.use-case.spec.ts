import { PermissionCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { IdentityCoreUserModel } from '../../../domain';
import { IdentityCoreValidateSubjectUseCase } from '../identity-core-validate-subject.use-case';

describe('IdentityCoreValidateSubjectUseCase', () => {
  let repository: { findById: jest.Mock; findPermissionCodes: jest.Mock };
  let useCase: IdentityCoreValidateSubjectUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue(
        IdentityCoreUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
      findPermissionCodes: jest
        .fn()
        .mockResolvedValue([PermissionCodeEnum.ITEM_READ, PermissionCodeEnum.ITEM_WRITE]),
    };
    useCase = new IdentityCoreValidateSubjectUseCase(repository);
  });

  it('returns the subject of an active user with its current permissions', async () => {
    const subject = await useCase.execute({ userId: 'user-1' });

    expect(subject).toEqual({
      id: 'user-1',
      email: 'editor@example.com',
      roles: ['editor'],
      permissions: ['item:read', 'item:write'],
    });
    expect(repository.findPermissionCodes).toHaveBeenCalledWith('user-1');
  });

  it('returns nothing for an unknown user', async () => {
    repository.findById.mockResolvedValue(undefined);

    const subject = await useCase.execute({ userId: 'ghost' });

    expect(subject).toBeUndefined();
  });

  it('returns nothing for a disabled user', async () => {
    repository.findById.mockResolvedValue(
      IdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [],
      }),
    );

    const subject = await useCase.execute({ userId: 'user-1' });

    expect(subject).toBeUndefined();
    expect(repository.findPermissionCodes).not.toHaveBeenCalled();
  });
});
