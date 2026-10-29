import { RoleEnum } from '@acme-libs/kernel';
import { IamAssignRoleUseCase } from '../iam-assign-role.use-case';

describe('IamAssignRoleUseCase', () => {
  let assignRole: jest.Mock;
  let useCase: IamAssignRoleUseCase;

  beforeEach(() => {
    assignRole = jest.fn();
    useCase = new IamAssignRoleUseCase({
      registerUser: jest.fn(),
      assignRole,
      listRoles: jest.fn(),
      updateRolePermissions: jest.fn(),
    });
  });

  describe('execute', () => {
    it('grants the role through identity and answers the roles the user holds now', async () => {
      assignRole.mockResolvedValue({ id: 'user-1', roles: [RoleEnum.EDITOR, RoleEnum.VIEWER] });

      const user = await useCase.execute({ userId: 'user-1', role: RoleEnum.VIEWER });

      expect(user).toEqual({ id: 'user-1', roles: ['editor', 'viewer'] });
      expect(assignRole).toHaveBeenCalledWith({ userId: 'user-1', role: 'viewer' });
    });
  });
});
