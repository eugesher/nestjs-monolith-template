import { CredentialsLibSignAccessTokenUseCase } from '../credentials-lib-sign-access-token.use-case';

describe('CredentialsLibSignAccessTokenUseCase', () => {
  let sign: jest.Mock;
  let useCase: CredentialsLibSignAccessTokenUseCase;

  beforeEach(() => {
    sign = jest.fn().mockResolvedValue('access-token');
    useCase = new CredentialsLibSignAccessTokenUseCase({ sign });
  });

  it('signs an access token for the subject', async () => {
    const accessToken = await useCase.execute({ sub: 'user-1' });

    expect(accessToken).toBe('access-token');
    expect(sign).toHaveBeenCalledWith({ sub: 'user-1' });
  });
});
