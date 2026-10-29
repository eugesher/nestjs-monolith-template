import { SessionRefreshUseCase } from '../session-refresh.use-case';

describe('SessionRefreshUseCase', () => {
  let refresh: jest.Mock;
  let useCase: SessionRefreshUseCase;

  beforeEach(() => {
    refresh = jest.fn();
    useCase = new SessionRefreshUseCase({ login: jest.fn(), refresh });
  });

  describe('execute', () => {
    it('exchanges the refresh token for a fresh pair of identity', async () => {
      refresh.mockResolvedValue({ accessToken: 'access-2', refreshToken: 'refresh-2' });

      const tokenPair = await useCase.execute({ refreshToken: 'refresh-1' });

      expect(tokenPair).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-2' });
      expect(refresh).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
    });

    it('lets a refusal of identity through', async () => {
      refresh.mockRejectedValue(new Error('Refresh token is invalid or expired'));

      const execution = useCase.execute({ refreshToken: 'refresh-1' });

      await expect(execution).rejects.toThrow('Refresh token is invalid or expired');
    });
  });
});
