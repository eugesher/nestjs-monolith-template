import { SessionDomainException } from '../../../domain';
import { SessionMeUseCase } from '../session-me.use-case';

describe('SessionMeUseCase', () => {
  let findSubject: jest.Mock;
  let useCase: SessionMeUseCase;

  beforeEach(() => {
    findSubject = jest.fn();
    useCase = new SessionMeUseCase({ login: jest.fn(), findSubject });
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

      await expect(execution).rejects.toBeInstanceOf(SessionDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'User user-1 was not found',
      });
    });
  });
});
