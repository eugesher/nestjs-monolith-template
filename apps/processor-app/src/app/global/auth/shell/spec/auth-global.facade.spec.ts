import { AuthGlobalValidateSubjectUseCase } from '../../application';
import { AuthGlobalFacade } from '../auth-global.facade';

describe('AuthGlobalFacade', () => {
  let findSubject: jest.Mock;
  let facade: AuthGlobalFacade;

  beforeEach(() => {
    findSubject = jest.fn();
    facade = new AuthGlobalFacade(new AuthGlobalValidateSubjectUseCase({ findSubject }));
  });

  describe('handleValidate', () => {
    it('answers the user with its permission codes for the token subject', async () => {
      findSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        permissionCodes: ['ledger:read'],
      });

      const user = await facade.handleValidate({ sub: 'user-1' });

      expect(user).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        permissionCodes: ['ledger:read'],
      });
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('answers no user when the subject is not an active staff user', async () => {
      findSubject.mockResolvedValue(null);

      const user = await facade.handleValidate({ sub: 'user-1' });

      expect(user).toBeNull();
    });
  });
});
