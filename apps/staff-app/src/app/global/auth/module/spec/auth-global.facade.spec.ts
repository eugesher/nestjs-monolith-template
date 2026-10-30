import { AuthGlobalValidateSubjectUseCase } from '../../application';
import { AuthGlobalFacade } from '../auth-global.facade';

describe('AuthGlobalFacade', () => {
  let findSubject: jest.Mock;
  let facade: AuthGlobalFacade;

  beforeEach(() => {
    findSubject = jest.fn();
    facade = new AuthGlobalFacade(new AuthGlobalValidateSubjectUseCase({ findSubject }));
  });

  describe('validate', () => {
    it('answers the user the common auth module re-derives for the token subject', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });

      const user = await facade.validate({ sub: 'user-1' });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com' });
      expect(findSubject).toHaveBeenCalledWith('user-1');
    });

    it('answers no user when the subject is not an active staff user', async () => {
      findSubject.mockResolvedValue(undefined);

      const user = await facade.validate({ sub: 'user-1' });

      expect(user).toBeUndefined();
    });
  });
});
