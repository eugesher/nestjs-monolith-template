import { RoleEnum } from '@acme-libs/kernel';
import { UserAssignRoleUseCase, UserRegisterUseCase } from '../../../application';
import { UserController } from '../user.controller';

describe('UserController', () => {
  let register: jest.Mock;
  let assignRole: jest.Mock;
  let controller: UserController;

  beforeEach(() => {
    register = jest.fn();
    assignRole = jest.fn();

    controller = new UserController(
      { execute: register } as unknown as UserRegisterUseCase,
      { execute: assignRole } as unknown as UserAssignRoleUseCase,
    );
  });

  describe('handleRegister', () => {
    it('answers the registered user', async () => {
      register.mockResolvedValue({ id: 'user-1', email: 'ann@example.com' });

      const response = await controller.handleRegister({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [RoleEnum.EDITOR],
      });

      expect(response).toEqual({ id: 'user-1', email: 'ann@example.com' });
    });
  });

  describe('handleAssignRole', () => {
    it('grants the role of the body to the user of the path', async () => {
      assignRole.mockResolvedValue({ id: 'user-1', roles: [RoleEnum.VIEWER] });

      const response = await controller.handleAssignRole('user-1', { role: RoleEnum.VIEWER });

      expect(response).toEqual({ id: 'user-1', roles: ['viewer'] });
      expect(assignRole).toHaveBeenCalledWith({ userId: 'user-1', role: 'viewer' });
    });
  });
});
