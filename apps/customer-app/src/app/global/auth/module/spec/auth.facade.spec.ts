import { AuthIdentityCoreAdapter } from '../../infrastructure';
import { AuthFacade } from '../auth.facade';

describe('AuthFacade', () => {
  let findSubject: jest.Mock;
  let findPermissionCodes: jest.Mock;
  let facade: AuthFacade;

  beforeEach(() => {
    findSubject = jest.fn();
    findPermissionCodes = jest.fn();
    facade = new AuthFacade({
      findSubject,
      findPermissionCodes,
    } as unknown as AuthIdentityCoreAdapter);
  });

  describe('validate', () => {
    it('answers the user identity re-derives for the token subject', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['viewer'] });

      const user = await facade.validate({ sub: 'user-1' });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['viewer'] });
      expect(findSubject).toHaveBeenCalledWith({ sub: 'user-1' });
    });

    it('answers no user when identity rejects the subject', async () => {
      findSubject.mockResolvedValue(undefined);

      const user = await facade.validate({ sub: 'user-1' });

      expect(user).toBeUndefined();
    });
  });

  describe('findPermissionCodes', () => {
    it('answers the permission codes identity reads for the user', async () => {
      findPermissionCodes.mockResolvedValue(['item:read']);

      const codes = await facade.findPermissionCodes({ userId: 'user-1' });

      expect(codes).toEqual(['item:read']);
      expect(findPermissionCodes).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
