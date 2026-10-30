import { AuthGlobalStaffIdentityCommonAdapter } from '../../infrastructure';
import { AuthGlobalFacade } from '../auth-global.facade';

describe('AuthGlobalFacade', () => {
  let findSubject: jest.Mock;
  let facade: AuthGlobalFacade;

  beforeEach(() => {
    findSubject = jest.fn();
    facade = new AuthGlobalFacade({
      findSubject,
    } as unknown as AuthGlobalStaffIdentityCommonAdapter);
  });

  describe('validate', () => {
    it('answers the user identity re-derives for the token subject', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com' });

      const user = await facade.validate({ sub: 'user-1' });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com' });
      expect(findSubject).toHaveBeenCalledWith({ sub: 'user-1' });
    });

    it('answers no user when identity rejects the subject', async () => {
      findSubject.mockResolvedValue(undefined);

      const user = await facade.validate({ sub: 'user-1' });

      expect(user).toBeUndefined();
    });
  });
});
