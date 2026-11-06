import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let handleFindByEmail: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    handleFindByEmail = jest.fn();
    adapter = new AuthIdentityCoreAdapter({ handleFindSubject: jest.fn(), handleFindByEmail });
  });

  describe('findByEmail', () => {
    it('answers the user the core staff auth module finds for the email', async () => {
      handleFindByEmail.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      const user = await adapter.findByEmail({ email: 'ann@example.com' });

      expect(user).toEqual({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });
      expect(handleFindByEmail).toHaveBeenCalledWith({ email: 'ann@example.com' });
    });
  });
});
