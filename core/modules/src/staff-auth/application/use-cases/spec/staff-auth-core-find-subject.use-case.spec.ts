import { StaffAuthCoreFindSubjectUseCase } from '../staff-auth-core-find-subject.use-case';

describe('StaffAuthCoreFindSubjectUseCase', () => {
  let findActiveById: jest.Mock;
  let useCase: StaffAuthCoreFindSubjectUseCase;

  beforeEach(() => {
    findActiveById = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'editor@example.com',
      userRoles: [{ role: { name: 'editor', rolePermissions: [{ code: 'ledger:read' }] } }],
    });
    useCase = new StaffAuthCoreFindSubjectUseCase({ findActiveById });
  });

  describe('execute', () => {
    it('answers the active user with its roles and permission codes', async () => {
      const subject = await useCase.execute({ userId: 'user-1' });

      expect(subject).toEqual({
        id: 'user-1',
        email: 'editor@example.com',
        roles: ['editor'],
        permissionCodes: ['ledger:read'],
      });
      expect(findActiveById).toHaveBeenCalledWith('user-1');
    });

    it('answers null when no active user matches', async () => {
      findActiveById.mockResolvedValue(null);

      const subject = await useCase.execute({ userId: 'ghost' });

      expect(subject).toBeNull();
    });
  });
});
