import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { AuthCommonStaffUserModel } from '../../../domain';
import { AuthCommonValidateSubjectUseCase } from '../auth-common-validate-subject.use-case';

describe('AuthCommonValidateSubjectUseCase', () => {
  let repository: { findById: jest.Mock };
  let useCase: AuthCommonValidateSubjectUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue(
        AuthCommonStaffUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
    };
    useCase = new AuthCommonValidateSubjectUseCase(repository);
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
      AuthCommonStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        status: UserStatusEnum.DISABLED,
        roles: [],
      }),
    );

    const subject = await useCase.execute({ userId: 'user-1' });

    expect(subject).toBeUndefined();
  });
});
