import { UserReassignRolesUseCase, UserRegisterUseCase } from '../../../application';
import { UserController } from '../user.controller';

describe('UserController', () => {
  let register: jest.Mock;
  let reassignRoles: jest.Mock;
  let controller: UserController;

  beforeEach(() => {
    register = jest.fn();
    reassignRoles = jest.fn();

    controller = new UserController(
      { execute: register } as unknown as UserRegisterUseCase,
      { execute: reassignRoles } as unknown as UserReassignRolesUseCase,
    );
  });

  describe('handleRegister', () => {
    it('answers the registered user', async () => {
      register.mockResolvedValue({ id: 'user-1', email: 'ann@example.com' });

      const response = await controller.handleRegister({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roleIds: ['2'],
      });

      expect(response).toEqual({ id: 'user-1', email: 'ann@example.com' });
    });
  });

  describe('handleReassignRoles', () => {
    it('reassigns the roles of the user of the path with the ids of the body', async () => {
      reassignRoles.mockResolvedValue({ id: 'user-1', roleIds: ['3'] });

      const response = await controller.handleReassignRoles('user-1', { roleIds: ['3'] });

      expect(response).toEqual({ id: 'user-1', roleIds: ['3'] });
      expect(reassignRoles).toHaveBeenCalledWith({ userId: 'user-1', roleIds: ['3'] });
    });
  });
});
