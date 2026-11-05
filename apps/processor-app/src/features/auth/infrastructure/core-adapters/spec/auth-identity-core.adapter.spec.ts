import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let findByEmail: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    findByEmail = jest.fn();
    adapter = new AuthIdentityCoreAdapter({ findSubject: jest.fn(), findByEmail });
  });

  describe('findByEmail', () => {
    it('answers the user the core staff auth module finds for the email', async () => {
      findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      const user = await adapter.findByEmail({ email: 'ann@example.com' });

      expect(user).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });
      expect(findByEmail).toHaveBeenCalledWith({ email: 'ann@example.com' });
    });
  });
});
