import { SessionLoginUseCase } from '../session-login.use-case';

describe('SessionLoginUseCase', () => {
  let login: jest.Mock;
  let useCase: SessionLoginUseCase;

  beforeEach(() => {
    login = jest.fn();
    useCase = new SessionLoginUseCase({ login, refresh: jest.fn() });
  });

  describe('execute', () => {
    it('exchanges the credentials for the token pair of identity', async () => {
      login.mockResolvedValue({ accessToken: 'access-1', refreshToken: 'refresh-1' });

      const tokenPair = await useCase.execute({ email: 'ann@example.com', password: 'secret' });

      expect(tokenPair).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
      expect(login).toHaveBeenCalledWith({ email: 'ann@example.com', password: 'secret' });
    });

    it('lets a refusal of identity through', async () => {
      login.mockRejectedValue(new Error('Invalid credentials'));

      const execution = useCase.execute({ email: 'ann@example.com', password: 'wrong' });

      await expect(execution).rejects.toThrow('Invalid credentials');
    });
  });
});
