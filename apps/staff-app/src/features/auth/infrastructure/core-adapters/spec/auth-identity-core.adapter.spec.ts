import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let handleFindSubject: jest.Mock;
  let handleFindByEmail: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    handleFindSubject = jest.fn();
    handleFindByEmail = jest.fn();
    adapter = new AuthIdentityCoreAdapter({ handleFindSubject, handleFindByEmail });
  });

  describe('findSubject', () => {
    it('answers the subject the core staff auth module finds for the user', async () => {
      handleFindSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissionCodes: ['ledger:read'],
      });

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(handleFindSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('answers null when the core staff auth module finds no active user', async () => {
      handleFindSubject.mockResolvedValue(null);

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toBeNull();
    });
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
