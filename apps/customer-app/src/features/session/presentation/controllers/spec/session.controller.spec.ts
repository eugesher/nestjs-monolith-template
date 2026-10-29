import { SessionLoginUseCase, SessionRegisterUseCase } from '../../../application';
import { SessionController } from '../session.controller';

describe('SessionController', () => {
  let register: jest.Mock;
  let login: jest.Mock;
  let controller: SessionController;

  beforeEach(() => {
    register = jest.fn();
    login = jest.fn();
    controller = new SessionController(
      new SessionRegisterUseCase({ register, login }),
      new SessionLoginUseCase({ register, login }),
    );
  });

  describe('handleRegister', () => {
    it('answers the customer the register use case created', async () => {
      register.mockResolvedValue({ id: 'customer-1', email: 'eve@example.com' });

      const response = await controller.handleRegister({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });

      expect(response).toEqual({ id: 'customer-1', email: 'eve@example.com' });
      expect(register).toHaveBeenCalledWith({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });
    });
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
      const response = controller.handleMe({ id: 'customer-1', email: 'ann@example.com' });

      expect(response).toEqual({ id: 'customer-1', email: 'ann@example.com' });
    });
  });
});
