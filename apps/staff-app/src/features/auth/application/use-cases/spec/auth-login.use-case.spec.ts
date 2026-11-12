import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthLoginUseCase } from '../auth-login.use-case';

describe('AuthLoginUseCase', () => {
  let login: jest.Mock;
  let useCase: AuthLoginUseCase;

  beforeEach(() => {
    login = jest.fn().mockResolvedValue({
      outcome: 'logged-in',
      userId: 'user-1',
      accessToken: 'access-token',
    });
    useCase = new AuthLoginUseCase({ findSubject: jest.fn(), login });
  });

  it('answers the access token of a login', async () => {
    const view = await useCase.execute({ email: 'editor@example.com', password: 'correct-horse' });

    expect(view).toEqual({ accessToken: 'access-token' });
    expect(login).toHaveBeenCalledWith({ email: 'editor@example.com', password: 'correct-horse' });
  });

  it('rejects invalid credentials', async () => {
    login.mockResolvedValue({
      outcome: 'invalid-credentials',
      userId: undefined,
      accessToken: undefined,
    });

    const execution = useCase.execute({ email: 'ghost@example.com', password: 'correct-horse' });

    await expect(execution).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
  });

  it('rejects a disabled user with its id', async () => {
    login.mockResolvedValue({ outcome: 'user-inactive', userId: 'user-1', accessToken: undefined });

    const execution = useCase.execute({ email: 'editor@example.com', password: 'correct-horse' });

    await expect(execution).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_USER_INACTIVE,
      message: 'User user-1 is disabled',
    });
  });
});
