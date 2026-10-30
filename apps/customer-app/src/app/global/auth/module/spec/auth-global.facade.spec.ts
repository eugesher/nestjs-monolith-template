import { UserStatusEnum } from '@acme-libs/kernel';
import { AuthGlobalValidateSubjectUseCase } from '../../application';
import { AuthGlobalFacade } from '../auth-global.facade';

describe('AuthGlobalFacade', () => {
  let findById: jest.Mock;
  let facade: AuthGlobalFacade;

  beforeEach(() => {
    findById = jest.fn();
    facade = new AuthGlobalFacade(new AuthGlobalValidateSubjectUseCase({ findById }));
  });

  describe('validate', () => {
    it('answers the active customer of the token subject', async () => {
      findById.mockResolvedValue({
        id: 'customer-1',
        email: 'ann@example.com',
        status: UserStatusEnum.ACTIVE,
      });

      const user = await facade.validate({ sub: 'customer-1' });

      expect(user).toEqual({ id: 'customer-1', email: 'ann@example.com' });
      expect(findById).toHaveBeenCalledWith('customer-1');
    });

    it('answers no user when the subject is not an active customer', async () => {
      findById.mockResolvedValue(undefined);

      const user = await facade.validate({ sub: 'customer-1' });

      expect(user).toBeUndefined();
    });
  });
});
