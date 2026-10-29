import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreUserModel } from '../../../domain';
import { StaffIdentityCoreValidateSubjectUseCase } from '../staff-identity-core-validate-subject.use-case';

describe('StaffIdentityCoreValidateSubjectUseCase', () => {
  let repository: { findById: jest.Mock };
  let useCase: StaffIdentityCoreValidateSubjectUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue(
        StaffIdentityCoreUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
    };
    useCase = new StaffIdentityCoreValidateSubjectUseCase(repository);
  });

  it('returns the subject of an active user without its permissions', async () => {
    const subject = await useCase.execute({ userId: 'user-1' });

    expect(subject).toEqual({ id: 'user-1', email: 'editor@example.com', roles: ['editor'] });
    expect(repository.findById).toHaveBeenCalledWith('user-1');
  });

  it('returns nothing for an unknown user', async () => {
    repository.findById.mockResolvedValue(undefined);

    const subject = await useCase.execute({ userId: 'ghost' });

    expect(subject).toBeUndefined();
  });

  it('returns nothing for a disabled user', async () => {
    repository.findById.mockResolvedValue(
      StaffIdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [],
      }),
    );

    const subject = await useCase.execute({ userId: 'user-1' });

    expect(subject).toBeUndefined();
  });
});
