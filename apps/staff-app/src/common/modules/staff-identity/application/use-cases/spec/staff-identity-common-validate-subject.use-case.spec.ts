import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonUserModel } from '../../../domain';
import { StaffIdentityCommonValidateSubjectUseCase } from '../staff-identity-common-validate-subject.use-case';

describe('StaffIdentityCommonValidateSubjectUseCase', () => {
  let repository: { findById: jest.Mock };
  let useCase: StaffIdentityCommonValidateSubjectUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue(
        StaffIdentityCommonUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
    };
    useCase = new StaffIdentityCommonValidateSubjectUseCase(repository);
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
      StaffIdentityCommonUserModel.reconstitute({
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
