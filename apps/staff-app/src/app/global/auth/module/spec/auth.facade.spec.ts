import { AuthStaffIdentityCoreAdapter } from '../../infrastructure';
import { AuthFacade } from '../auth.facade';

describe('AuthFacade', () => {
  let findSubject: jest.Mock;
  let facade: AuthFacade;

  beforeEach(() => {
    findSubject = jest.fn();
    facade = new AuthFacade({ findSubject } as unknown as AuthStaffIdentityCoreAdapter);
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
