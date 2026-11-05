import { AuthCommonStaffUserModel } from '../auth-common-staff-user.model';

describe('AuthCommonStaffUserModel', () => {
  describe('reconstitute', () => {
    it('restores the stored user with the names of its roles in order', () => {
      const user = AuthCommonStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        userRoles: [{ role: { name: 'viewer' } }, { role: { name: 'editor' } }],
      });

      expect(user).toMatchObject({
        id: 'user-1',
        email: 'viewer@example.com',
        roles: ['editor', 'viewer'],
      });
    });
  });
});
