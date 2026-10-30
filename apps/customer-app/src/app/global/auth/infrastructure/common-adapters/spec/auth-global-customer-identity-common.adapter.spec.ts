import { AuthGlobalCustomerIdentityCommonAdapter } from '../auth-global-customer-identity-common.adapter';

describe('AuthGlobalCustomerIdentityCommonAdapter', () => {
  let validateSubject: jest.Mock;
  let adapter: AuthGlobalCustomerIdentityCommonAdapter;

  beforeEach(() => {
    validateSubject = jest.fn();
    adapter = new AuthGlobalCustomerIdentityCommonAdapter({
      register: jest.fn(),
      login: jest.fn(),
      validateSubject,
    });
  });

  describe('findSubject', () => {
    it('asks identity for the customer the token names and answers it as the current user', async () => {
      validateSubject.mockResolvedValue({ id: 'customer-1', email: 'ann@example.com' });

      const user = await adapter.findSubject({ sub: 'customer-1' });

      expect(user).toEqual({ id: 'customer-1', email: 'ann@example.com' });
      expect(validateSubject).toHaveBeenCalledWith({ customerId: 'customer-1' });
    });

    it('answers no user when identity knows no active customer', async () => {
      validateSubject.mockResolvedValue(undefined);

      const user = await adapter.findSubject({ sub: 'customer-1' });

      expect(user).toBeUndefined();
    });
  });
});
