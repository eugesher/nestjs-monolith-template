import { StaffAuthCoreSubjectModel } from '../staff-auth-core-subject.model';

describe('StaffAuthCoreSubjectModel', () => {
  describe('reconstitute', () => {
    it(
      'restores the user with its roles and the ' + 'distinct codes of their permissions in order',
      () => {
        const subject = StaffAuthCoreSubjectModel.reconstitute({
          id: 'user-1',
          email: 'viewer@example.com',
          userRoles: [
            {
              role: {
                name: 'viewer',
                rolePermissions: [
                  { permission: { code: 'order:read' } },
                  { permission: { code: 'ledger:read' } },
                ],
              },
            },
            {
              role: {
                name: 'editor',
                rolePermissions: [{ permission: { code: 'ledger:read' } }],
              },
            },
          ],
        });

        expect(subject).toMatchObject({
          id: 'user-1',
          email: 'viewer@example.com',
          roles: ['editor', 'viewer'],
          permissionCodes: ['ledger:read', 'order:read'],
        });
      },
    );

    it('restores a user without roles with no permissions', () => {
      const subject = StaffAuthCoreSubjectModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        userRoles: [],
      });

      expect(subject).toMatchObject({ roles: [], permissionCodes: [] });
    });
  });
});
