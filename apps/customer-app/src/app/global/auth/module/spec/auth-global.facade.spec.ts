import { AuthGlobalCustomerIdentityCoreAdapter } from '../../infrastructure';
import { AuthGlobalFacade } from '../auth-global.facade';

describe('AuthGlobalFacade', () => {
  let findSubject: jest.Mock;
  let facade: AuthGlobalFacade;

  beforeEach(() => {
    findSubject = jest.fn();
    facade = new AuthGlobalFacade({
      findSubject,
    } as unknown as AuthGlobalCustomerIdentityCoreAdapter);
  });

  describe('validate', () => {
    it('answers the customer identity re-derives for the token subject', async () => {
      findSubject.mockResolvedValue({ id: 'customer-1', email: 'ann@example.com' });

      const user = await facade.validate({ sub: 'customer-1' });

      expect(user).toEqual({ id: 'customer-1', email: 'ann@example.com' });
      expect(findSubject).toHaveBeenCalledWith({ sub: 'customer-1' });
    });

    it('answers no user when identity rejects the subject', async () => {
      findSubject.mockResolvedValue(undefined);

      const user = await facade.validate({ sub: 'customer-1' });

      expect(user).toBeUndefined();
    });
  });
});
