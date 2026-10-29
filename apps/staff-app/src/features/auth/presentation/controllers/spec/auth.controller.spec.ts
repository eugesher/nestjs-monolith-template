import { AuthLoginUseCase, AuthMeUseCase } from '../../../application';
import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  let login: jest.Mock;
  let findSubject: jest.Mock;
  let controller: AuthController;

  beforeEach(() => {
    login = jest.fn();
    findSubject = jest.fn();
    controller = new AuthController(
      new AuthLoginUseCase({ login, findSubject }),
      new AuthMeUseCase({ login, findSubject }),
    );
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

  describe('handleMe', () => {
    it('answers the current user with the roles identity reads for them', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });

      const response = await controller.handleMe({ id: 'user-1', email: 'ann@example.com' });

      expect(response).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
