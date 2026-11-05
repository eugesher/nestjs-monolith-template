import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let findSubject: jest.Mock;
  let findByEmail: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    findSubject = jest.fn();
    findByEmail = jest.fn();
    adapter = new AuthIdentityCoreAdapter({ findSubject, findByEmail });
  });

  describe('findSubject', () => {
    it('answers the subject the core staff auth module finds for the user', async () => {
      findSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissionCodes: ['ledger:read'],
      });

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('answers null when the core staff auth module finds no active user', async () => {
      findSubject.mockResolvedValue(null);

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toBeNull();
    });
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
