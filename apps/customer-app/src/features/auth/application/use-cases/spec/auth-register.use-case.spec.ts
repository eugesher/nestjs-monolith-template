import { AuthLedgerService } from '../../services/auth-ledger.service';
import { AuthRegisterUseCase } from '../auth-register.use-case';

describe('AuthRegisterUseCase', () => {
  let register: jest.Mock;
  let recordRegistered: jest.Mock;
  let useCase: AuthRegisterUseCase;

  beforeEach(() => {
    register = jest.fn();
    recordRegistered = jest.fn().mockResolvedValue(undefined);
    useCase = new AuthRegisterUseCase({ recordRegistered } as unknown as AuthLedgerService, {
      login: jest.fn(),
      register,
    });
  });

  describe('execute', () => {
    it('registers the customer through identity, records it in the ledger and answers who was created', async () => {
      register.mockResolvedValue({ id: 'customer-1', email: 'eve@example.com' });

      const customer = await useCase.execute({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });

      expect(customer).toEqual({ id: 'customer-1', email: 'eve@example.com' });
      expect(register).toHaveBeenCalledWith({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });
      expect(recordRegistered).toHaveBeenCalledWith({
        customerId: 'customer-1',
        email: 'eve@example.com',
      });
    });

    it('lets a refusal of identity through and records nothing', async () => {
      register.mockRejectedValue(new Error('Email eve@example.com is already registered'));

      const execution = useCase.execute({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });

      await expect(execution).rejects.toThrow('Email eve@example.com is already registered');
      expect(recordRegistered).not.toHaveBeenCalled();
    });
  });
});
