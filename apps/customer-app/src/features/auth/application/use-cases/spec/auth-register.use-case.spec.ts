import { AuthRegisterUseCase } from '../auth-register.use-case';

describe('AuthRegisterUseCase', () => {
  let register: jest.Mock;
  let useCase: AuthRegisterUseCase;

  beforeEach(() => {
    register = jest.fn();
    useCase = new AuthRegisterUseCase({ login: jest.fn(), register });
  });

  describe('execute', () => {
    it('registers the customer through identity and answers who was created', async () => {
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
    });

    it('lets a refusal of identity through', async () => {
      register.mockRejectedValue(new Error('Email eve@example.com is already registered'));

      const execution = useCase.execute({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });

      await expect(execution).rejects.toThrow('Email eve@example.com is already registered');
    });
  });
});
