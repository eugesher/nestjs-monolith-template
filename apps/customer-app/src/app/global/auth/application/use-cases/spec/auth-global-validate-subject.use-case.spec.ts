import { UserStatusEnum } from '@acme-libs/kernel';
import { AuthGlobalValidateSubjectUseCase } from '../auth-global-validate-subject.use-case';

describe('AuthGlobalValidateSubjectUseCase', () => {
  let findById: jest.Mock;
  let useCase: AuthGlobalValidateSubjectUseCase;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({
      id: 'customer-1',
      email: 'ann@example.com',
      status: UserStatusEnum.ACTIVE,
    });
    useCase = new AuthGlobalValidateSubjectUseCase({ findById });
  });

  describe('execute', () => {
    it('returns the id and the email of an active customer', async () => {
      const subject = await useCase.execute({ customerId: 'customer-1' });

      expect(subject).toEqual({ id: 'customer-1', email: 'ann@example.com' });
      expect(findById).toHaveBeenCalledWith('customer-1');
    });

    it('returns nothing for an unknown customer', async () => {
      findById.mockResolvedValue(undefined);

      const subject = await useCase.execute({ customerId: 'ghost' });

      expect(subject).toBeUndefined();
    });

    it('returns nothing for a disabled customer', async () => {
      findById.mockResolvedValue({
        id: 'customer-1',
        email: 'ann@example.com',
        status: UserStatusEnum.DISABLED,
      });

      const subject = await useCase.execute({ customerId: 'customer-1' });

      expect(subject).toBeUndefined();
    });
  });
});
