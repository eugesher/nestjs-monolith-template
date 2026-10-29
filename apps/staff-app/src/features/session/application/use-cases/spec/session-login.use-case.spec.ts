import { SessionLoginUseCase } from '../session-login.use-case';

describe('SessionLoginUseCase', () => {
  let login: jest.Mock;
  let useCase: SessionLoginUseCase;

  beforeEach(() => {
    login = jest.fn();
    useCase = new SessionLoginUseCase({ login, findSubject: jest.fn() });
  });

  describe('execute', () => {
    it('exchanges the credentials for the access token of identity', async () => {
      login.mockResolvedValue({ accessToken: 'access-1' });

      const accessToken = await useCase.execute({ email: 'ann@example.com', password: 'secret' });

      expect(accessToken).toEqual({ accessToken: 'access-1' });
      expect(login).toHaveBeenCalledWith({ email: 'ann@example.com', password: 'secret' });
    });

    it('lets a refusal of identity through', async () => {
      login.mockRejectedValue(new Error('Invalid credentials'));

      const execution = useCase.execute({ email: 'ann@example.com', password: 'wrong' });

      await expect(execution).rejects.toThrow('Invalid credentials');
    });
  });
});
