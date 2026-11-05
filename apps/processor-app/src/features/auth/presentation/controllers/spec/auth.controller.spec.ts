import { AuthLoginUseCase } from '../../../application';
import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  let login: jest.Mock;
  let controller: AuthController;

  beforeEach(() => {
    login = jest.fn();
    controller = new AuthController({ execute: login } as unknown as AuthLoginUseCase);
  });

  describe('handleLogin', () => {
    it('answers the access token of the login use case', async () => {
      login.mockResolvedValue({ accessToken: 'access-1' });

      const response = await controller.handleLogin({
        email: 'ann@example.com',
        password: 'secret',
      });

      expect(response).toEqual({ accessToken: 'access-1' });
      expect(login).toHaveBeenCalledWith({ email: 'ann@example.com', password: 'secret' });
    });
  });
});
