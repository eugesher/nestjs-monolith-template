import { AuthGlobalValidateSubjectUseCase } from '../../application';
import { AuthGlobalFacade } from '../auth-global.facade';

describe('AuthGlobalFacade', () => {
  let findActiveById: jest.Mock;
  let facade: AuthGlobalFacade;

  beforeEach(() => {
    findActiveById = jest.fn();
    facade = new AuthGlobalFacade(new AuthGlobalValidateSubjectUseCase({ findActiveById }));
  });

  describe('validate', () => {
    it('answers the active customer of the token subject', async () => {
      findActiveById.mockResolvedValue({
        id: 'customer-1',
        email: 'ann@example.com',
      });

      const user = await facade.validate({ sub: 'customer-1' });

      expect(user).toEqual({ id: 'customer-1', email: 'ann@example.com' });
      expect(findActiveById).toHaveBeenCalledWith('customer-1');
    });

    it('answers no user when the subject is not an active customer', async () => {
      findActiveById.mockResolvedValue(undefined);

      const user = await facade.validate({ sub: 'customer-1' });

      expect(user).toBeUndefined();
    });
  });
});
