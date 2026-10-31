import { RoleEnum } from '@acme-libs/kernel';
import { AuthCommonStaffUserModel } from '../auth-common-staff-user.model';

describe('AuthCommonStaffUserModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const user = AuthCommonStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        roles: [RoleEnum.VIEWER],
      });

      expect(user).toMatchObject({
        id: 'user-1',
        email: 'viewer@example.com',
        roles: ['viewer'],
      });
    });
  });
});
