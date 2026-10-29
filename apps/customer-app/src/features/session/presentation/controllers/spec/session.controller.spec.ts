import { RoleEnum } from '@acme-libs/kernel';
import { SessionLoginUseCase } from '../../../application';
import { SessionController } from '../session.controller';

describe('SessionController', () => {
  let login: jest.Mock;
  let controller: SessionController;

  beforeEach(() => {
    login = jest.fn();
    controller = new SessionController(new SessionLoginUseCase({ login }));
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
    it('answers the current user exactly as the guards resolved it', () => {
      const response = controller.handleMe({
        id: 'user-1',
        email: 'ann@example.com',
        roles: [RoleEnum.ADMIN],
      });

      expect(response).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
      });
    });
  });
});
