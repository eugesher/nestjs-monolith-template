import { RoleEnum } from '@acme-libs/kernel';
import { AuthCommonStaffUserModel } from '../../../domain';
import { AuthCommonValidateSubjectUseCase } from '../auth-common-validate-subject.use-case';

describe('AuthCommonValidateSubjectUseCase', () => {
  let repository: { findActiveById: jest.Mock };
  let useCase: AuthCommonValidateSubjectUseCase;

  beforeEach(() => {
    repository = {
      findActiveById: jest.fn().mockResolvedValue(
        AuthCommonStaffUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          roles: [RoleEnum.EDITOR],
        }),
      ),
    };
    useCase = new AuthCommonValidateSubjectUseCase(repository);
  });

  it('returns the subject of an active user without its permissions', async () => {
    const subject = await useCase.execute({ userId: 'user-1' });

    expect(subject).toEqual({ id: 'user-1', email: 'editor@example.com', roles: ['editor'] });
    expect(repository.findActiveById).toHaveBeenCalledWith('user-1');
  });

  it('returns nothing when no active user matches', async () => {
    repository.findActiveById.mockResolvedValue(undefined);

    const subject = await useCase.execute({ userId: 'ghost' });

    expect(subject).toBeUndefined();
  });
});
