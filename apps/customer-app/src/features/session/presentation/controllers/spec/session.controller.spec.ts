import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { SessionLoginUseCase, SessionRefreshUseCase } from '../../../application';
import { SessionController } from '../session.controller';

describe('SessionController', () => {
  let login: jest.Mock;
  let refresh: jest.Mock;
  let controller: SessionController;

  beforeEach(() => {
    login = jest.fn();
    refresh = jest.fn();
    controller = new SessionController(
      new SessionLoginUseCase({ login, refresh }),
      new SessionRefreshUseCase({ login, refresh }),
    );
  });

  describe('handleLogin', () => {
    it('answers the token pair of the login use case', async () => {
      login.mockResolvedValue({ accessToken: 'access-1', refreshToken: 'refresh-1' });

      const response = await controller.handleLogin({
        email: 'ann@example.com',
        password: 'secret',
      });

      expect(response).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
      expect(login).toHaveBeenCalledWith({ email: 'ann@example.com', password: 'secret' });
    });
  });

  describe('handleRefresh', () => {
    it('answers the fresh pair of the refresh use case', async () => {
      refresh.mockResolvedValue({ accessToken: 'access-2', refreshToken: 'refresh-2' });

      const response = await controller.handleRefresh({ refreshToken: 'refresh-1' });

      expect(response).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-2' });
      expect(refresh).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
    });
  });

  describe('handleMe', () => {
    it('answers the current user exactly as the guards resolved it', () => {
      const response = controller.handleMe({
        id: 'user-1',
        email: 'ann@example.com',
        roles: [RoleEnum.ADMIN],
        permissions: [PermissionCodeEnum.ITEM_READ],
      });

      expect(response).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissions: ['item:read'],
      });
    });
  });
});
