import { AuthGlobalFindRolesUseCase } from '../auth-global-find-roles.use-case';

describe('AuthGlobalFindRolesUseCase', () => {
  let findSubject: jest.Mock;
  let useCase: AuthGlobalFindRolesUseCase;

  beforeEach(() => {
    findSubject = jest.fn();
    useCase = new AuthGlobalFindRolesUseCase({ findSubject });
  });

  describe('execute', () => {
    it('answers the roles of the subject', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });

      const roles = await useCase.execute({ userId: 'user-1' });

      expect(roles).toEqual(['admin']);
      expect(findSubject).toHaveBeenCalledWith('user-1');
    });

    it('answers no roles when there is no active subject', async () => {
      findSubject.mockResolvedValue(undefined);

      const roles = await useCase.execute({ userId: 'user-1' });

      expect(roles).toEqual([]);
    });
  });
});
