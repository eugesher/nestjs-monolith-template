import { AuthGlobalValidateSubjectUseCase } from '../auth-global-validate-subject.use-case';

describe('AuthGlobalValidateSubjectUseCase', () => {
  let findSubject: jest.Mock;
  let useCase: AuthGlobalValidateSubjectUseCase;

  beforeEach(() => {
    findSubject = jest.fn();
    useCase = new AuthGlobalValidateSubjectUseCase({ findSubject });
  });

  describe('execute', () => {
    it(
      'answers the id, the email and the permission ' + 'codes of the subject as the current user',
      async () => {
        findSubject.mockResolvedValue({
          id: 'user-1',
          email: 'ann@example.com',
          permissionCodes: ['ledger:read'],
        });

        const user = await useCase.execute({ userId: 'user-1' });

        expect(user).toEqual({
          id: 'user-1',
          email: 'ann@example.com',
          permissionCodes: ['ledger:read'],
        });
        expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
      },
    );

    it('answers no user when there is no active subject', async () => {
      findSubject.mockResolvedValue(null);

      const user = await useCase.execute({ userId: 'user-1' });

      expect(user).toBeNull();
    });
  });
});
