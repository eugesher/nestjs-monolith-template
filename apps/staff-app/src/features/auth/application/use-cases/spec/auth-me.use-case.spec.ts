import { AuthDomainException } from '../../../domain';
import { AuthMeUseCase } from '../auth-me.use-case';

describe('AuthMeUseCase', () => {
  let findSubject: jest.Mock;
  let useCase: AuthMeUseCase;

  beforeEach(() => {
    findSubject = jest.fn();
    useCase = new AuthMeUseCase({ login: jest.fn(), findSubject });
  });

  describe('execute', () => {
    it('answers the id, the email and the roles identity reads for the user', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });

      const me = await useCase.execute({ userId: 'user-1' });

      expect(me).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('refuses with AUTH_USER_NOT_FOUND when identity no longer knows an active user', async () => {
      findSubject.mockResolvedValue(undefined);

      const execution = useCase.execute({ userId: 'user-1' });

      await expect(execution).rejects.toBeInstanceOf(AuthDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'User user-1 was not found',
      });
    });
  });
});
