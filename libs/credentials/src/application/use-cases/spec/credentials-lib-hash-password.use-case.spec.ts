import { CredentialsLibHashPasswordUseCase } from '../credentials-lib-hash-password.use-case';

describe('CredentialsLibHashPasswordUseCase', () => {
  let hash: jest.Mock;
  let useCase: CredentialsLibHashPasswordUseCase;

  beforeEach(() => {
    hash = jest.fn().mockResolvedValue('argon-hash');
    useCase = new CredentialsLibHashPasswordUseCase({ hash, verify: jest.fn() });
  });

  it('hashes the password', async () => {
    const passwordHash = await useCase.execute('correct-horse-battery');

    expect(passwordHash).toBe('argon-hash');
    expect(hash).toHaveBeenCalledWith('correct-horse-battery');
  });
});
