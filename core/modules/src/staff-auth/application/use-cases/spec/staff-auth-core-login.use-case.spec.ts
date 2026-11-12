import type { PinoLogger } from 'nestjs-pino';

import { UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { StaffAuthCoreLoginUseCase } from '../staff-auth-core-login.use-case';

describe('StaffAuthCoreLoginUseCase', () => {
  let repository: { findByEmail: jest.Mock };
  let credentials: { issueAccessToken: jest.Mock; verifyPassword: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: StaffAuthCoreLoginUseCase;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      }),
    };
    credentials = {
      issueAccessToken: jest.fn().mockResolvedValue('access-token'),
      verifyPassword: jest.fn().mockResolvedValue(true),
    };
    logger = makePinoLoggerMock();
    useCase = new StaffAuthCoreLoginUseCase(
      repository,
      credentials,
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('issues an access token for the right password', async () => {
      const view = await useCase.execute({
        email: ' Editor@Example.com ',
        password: 'correct-horse',
      });

      expect(view).toEqual({ outcome: 'logged-in', userId: 'user-1', accessToken: 'access-token' });
      expect(repository.findByEmail).toHaveBeenCalledWith('editor@example.com');
      expect(credentials.verifyPassword).toHaveBeenCalledWith({
        passwordHash: 'hash',
        password: 'correct-horse',
      });
      expect(credentials.issueAccessToken).toHaveBeenCalledWith('user-1');
      expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1' }, 'User logged in');
    });

    it('answers an unknown email after the same password check and with the outcome of a wrong password', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const view = await useCase.execute({ email: 'ghost@example.com', password: 'correct-horse' });

      expect(view).toEqual({
        outcome: 'invalid-credentials',
        userId: undefined,
        accessToken: undefined,
      });
      expect(credentials.verifyPassword).toHaveBeenCalledWith({
        passwordHash: null,
        password: 'correct-horse',
      });
      expect(logger.warn).toHaveBeenCalledWith('Login failed: unknown email');
    });

    it('answers a wrong password', async () => {
      credentials.verifyPassword.mockResolvedValue(false);

      const view = await useCase.execute({ email: 'editor@example.com', password: 'wrong-horse' });

      expect(view).toEqual({
        outcome: 'invalid-credentials',
        userId: undefined,
        accessToken: undefined,
      });
      expect(credentials.issueAccessToken).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        { userId: 'user-1' },
        'Login failed: wrong password',
      );
    });

    it('answers a disabled user after checking the password', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      const view = await useCase.execute({
        email: 'editor@example.com',
        password: 'correct-horse',
      });

      expect(view).toEqual({ outcome: 'user-inactive', userId: 'user-1', accessToken: undefined });
      expect(credentials.verifyPassword).toHaveBeenCalled();
      expect(credentials.issueAccessToken).not.toHaveBeenCalled();
    });
  });
});
