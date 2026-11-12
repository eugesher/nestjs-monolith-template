import { StaffAuthCoreFacade } from '../staff-auth-core.facade';
import type { StaffAuthCoreFindSubjectUseCase, StaffAuthCoreLoginUseCase } from '../../application';

describe('StaffAuthCoreFacade', () => {
  let findSubject: jest.Mock;
  let login: jest.Mock;
  let facade: StaffAuthCoreFacade;

  beforeEach(() => {
    findSubject = jest.fn().mockResolvedValue(null);
    login = jest.fn().mockResolvedValue({
      outcome: 'logged-in',
      userId: 'user-1',
      accessToken: 'access-token',
    });
    facade = new StaffAuthCoreFacade(
      { execute: findSubject } as unknown as StaffAuthCoreFindSubjectUseCase,
      { execute: login } as unknown as StaffAuthCoreLoginUseCase,
    );
  });

  describe('handleFindSubject', () => {
    it('hands the command to the find subject use case', async () => {
      const subject = await facade.handleFindSubject({ userId: 'user-1' });

      expect(subject).toBeNull();
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });

  describe('handleLogin', () => {
    it('hands the command to the login use case', async () => {
      const view = await facade.handleLogin({
        email: 'admin@example.com',
        password: 'correct-horse',
      });

      expect(view).toEqual({ outcome: 'logged-in', userId: 'user-1', accessToken: 'access-token' });
      expect(login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'correct-horse' });
    });
  });
});
