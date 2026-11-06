import { StaffAuthCoreFindByEmailUseCase } from '../staff-auth-core-find-by-email.use-case';

describe('StaffAuthCoreFindByEmailUseCase', () => {
  let findByEmail: jest.Mock;
  let useCase: StaffAuthCoreFindByEmailUseCase;

  beforeEach(() => {
    findByEmail = jest.fn().mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash',
      status: 'active',
    });
    useCase = new StaffAuthCoreFindByEmailUseCase({ findByEmail });
  });

  describe('execute', () => {
    it('answers the user of the email whatever its status', async () => {
      const user = await useCase.execute({ email: 'admin@example.com' });

      expect(user).toEqual({
        id: 'user-1',
        passwordHash: 'hash',
        status: 'active',
      });
      expect(findByEmail).toHaveBeenCalledWith('admin@example.com');
    });

    it('answers null for an unknown email', async () => {
      findByEmail.mockResolvedValue(null);

      const user = await useCase.execute({ email: 'ghost@example.com' });

      expect(user).toBeNull();
    });
  });
});
