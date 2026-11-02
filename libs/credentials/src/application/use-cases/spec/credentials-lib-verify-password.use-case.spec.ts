import { CredentialsLibVerifyPasswordUseCase } from '../credentials-lib-verify-password.use-case';

describe('CredentialsLibVerifyPasswordUseCase', () => {
  let verify: jest.Mock;
  let useCase: CredentialsLibVerifyPasswordUseCase;

  beforeEach(() => {
    verify = jest.fn().mockResolvedValue(true);
    useCase = new CredentialsLibVerifyPasswordUseCase({ hash: jest.fn(), verify });
  });

  it('checks the password against its hash', async () => {
    const valid = await useCase.execute({ passwordHash: 'argon-hash', password: 'correct-horse' });

    expect(valid).toBe(true);
    expect(verify).toHaveBeenCalledWith({ passwordHash: 'argon-hash', password: 'correct-horse' });
  });
});
