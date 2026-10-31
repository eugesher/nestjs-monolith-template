import { AuthGlobalValidateSubjectUseCase } from '../auth-global-validate-subject.use-case';

describe('AuthGlobalValidateSubjectUseCase', () => {
  let findActiveById: jest.Mock;
  let useCase: AuthGlobalValidateSubjectUseCase;

  beforeEach(() => {
    findActiveById = jest.fn().mockResolvedValue({
      id: 'customer-1',
      email: 'ann@example.com',
    });
    useCase = new AuthGlobalValidateSubjectUseCase({ findActiveById });
  });

  describe('execute', () => {
    it('returns the id and the email of an active customer', async () => {
      const subject = await useCase.execute({ customerId: 'customer-1' });

      expect(subject).toEqual({ id: 'customer-1', email: 'ann@example.com' });
      expect(findActiveById).toHaveBeenCalledWith('customer-1');
    });

    it('returns nothing when no active customer matches', async () => {
      findActiveById.mockResolvedValue(undefined);

      const subject = await useCase.execute({ customerId: 'ghost' });

      expect(subject).toBeUndefined();
    });
  });
});
