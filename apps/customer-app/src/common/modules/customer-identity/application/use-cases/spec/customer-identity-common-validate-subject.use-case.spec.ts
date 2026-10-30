import { UserStatusEnum } from '@acme-libs/kernel';
import { CustomerIdentityCommonCustomerModel } from '../../../domain';
import { CustomerIdentityCommonValidateSubjectUseCase } from '../customer-identity-common-validate-subject.use-case';

describe('CustomerIdentityCommonValidateSubjectUseCase', () => {
  let repository: { findById: jest.Mock };
  let useCase: CustomerIdentityCommonValidateSubjectUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue(
        CustomerIdentityCommonCustomerModel.reconstitute({
          id: 'customer-1',
          email: 'ann@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
        }),
      ),
    };
    useCase = new CustomerIdentityCommonValidateSubjectUseCase(repository);
  });

  it('returns the id and the email of an active customer', async () => {
    const subject = await useCase.execute({ customerId: 'customer-1' });

    expect(subject).toEqual({ id: 'customer-1', email: 'ann@example.com' });
    expect(repository.findById).toHaveBeenCalledWith('customer-1');
  });

  it('returns nothing for an unknown customer', async () => {
    repository.findById.mockResolvedValue(undefined);

    const subject = await useCase.execute({ customerId: 'ghost' });

    expect(subject).toBeUndefined();
  });

  it('returns nothing for a disabled customer', async () => {
    repository.findById.mockResolvedValue(
      CustomerIdentityCommonCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      }),
    );

    const subject = await useCase.execute({ customerId: 'customer-1' });

    expect(subject).toBeUndefined();
  });
});
