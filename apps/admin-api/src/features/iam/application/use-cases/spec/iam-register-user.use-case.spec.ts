import { RoleEnum } from '@acme-libs/kernel';
import { IamRegisterUserUseCase } from '../iam-register-user.use-case';

describe('IamRegisterUserUseCase', () => {
  let registerUser: jest.Mock;
  let useCase: IamRegisterUserUseCase;

  beforeEach(() => {
    registerUser = jest.fn();
    useCase = new IamRegisterUserUseCase({
      registerUser,
      assignRole: jest.fn(),
      listRoles: jest.fn(),
      updateRolePermissions: jest.fn(),
    });
  });

  describe('execute', () => {
    it('registers the user through identity and answers its id and email', async () => {
      registerUser.mockResolvedValue({ id: 'user-1', email: 'ann@example.com' });

      const user = await useCase.execute({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [RoleEnum.EDITOR],
      });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com' });
      expect(registerUser).toHaveBeenCalledWith({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: ['editor'],
      });
    });
  });
});
