import {
  StaffAuthCoreFindByEmailUseCase,
  StaffAuthCoreFindSubjectUseCase,
} from '../../application';
import { StaffAuthCoreFacade } from '../staff-auth-core.facade';

describe('StaffAuthCoreFacade', () => {
  let findSubject: jest.Mock;
  let findByEmail: jest.Mock;
  let facade: StaffAuthCoreFacade;

  beforeEach(() => {
    findSubject = jest.fn().mockResolvedValue(null);
    findByEmail = jest.fn().mockResolvedValue(null);
    facade = new StaffAuthCoreFacade(
      { execute: findSubject } as unknown as StaffAuthCoreFindSubjectUseCase,
      { execute: findByEmail } as unknown as StaffAuthCoreFindByEmailUseCase,
    );
  });

  describe('handleFindSubject', () => {
    it('hands the command to the find subject use case', async () => {
      const subject = await facade.handleFindSubject({ userId: 'user-1' });

      expect(subject).toBeNull();
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });

  describe('handleFindByEmail', () => {
    it('hands the command to the find by email use case', async () => {
      const user = await facade.handleFindByEmail({ email: 'admin@example.com' });

      expect(user).toBeNull();
      expect(findByEmail).toHaveBeenCalledWith({ email: 'admin@example.com' });
    });
  });
});
