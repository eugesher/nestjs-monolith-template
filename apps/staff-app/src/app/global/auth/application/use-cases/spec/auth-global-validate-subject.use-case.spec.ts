import { AuthGlobalValidateSubjectUseCase } from '../auth-global-validate-subject.use-case';

describe('AuthGlobalValidateSubjectUseCase', () => {
  let findSubject: jest.Mock;
  let useCase: AuthGlobalValidateSubjectUseCase;

  beforeEach(() => {
    findSubject = jest.fn();
    useCase = new AuthGlobalValidateSubjectUseCase({ findSubject });
  });

  describe('execute', () => {
    it('answers the id and the email of the subject as the current user', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });

      const user = await useCase.execute({ userId: 'user-1' });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com' });
      expect(findSubject).toHaveBeenCalledWith('user-1');
    });

    it('answers no user when there is no active subject', async () => {
      findSubject.mockResolvedValue(undefined);

      const user = await useCase.execute({ userId: 'user-1' });

      expect(user).toBeUndefined();
    });
  });
});
