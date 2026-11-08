import { LocalStorageTransactionAfterCommitUseCase } from '../local-storage-transaction-after-commit.use-case';

describe('LocalStorageTransactionAfterCommitUseCase', () => {
  let isActive: jest.Mock;
  let getHooks: jest.Mock;
  let useCase: LocalStorageTransactionAfterCommitUseCase;

  beforeEach(() => {
    isActive = jest.fn().mockReturnValue(true);
    getHooks = jest.fn().mockReturnValue([]);
    useCase = new LocalStorageTransactionAfterCommitUseCase(
      { isActive, withTransaction: jest.fn() },
      { run: jest.fn(), setHooks: jest.fn(), getHooks },
    );
  });

  it('adds the hook to the hooks of the open run', () => {
    const hooks: (() => Promise<void>)[] = [];
    const hook = (): Promise<void> => Promise.resolve();
    getHooks.mockReturnValue(hooks);

    useCase.execute(hook);

    expect(hooks).toEqual([hook]);
  });

  it('refuses a hook while no transaction is open', () => {
    isActive.mockReturnValue(false);

    expect(() => useCase.execute(() => Promise.resolve())).toThrow(
      'afterCommit must be called inside TRANSACTION_PORT.run',
    );
  });

  it('refuses a hook when the run holds no hooks', () => {
    getHooks.mockReturnValue(undefined);

    expect(() => useCase.execute(() => Promise.resolve())).toThrow(
      'afterCommit must be called inside TRANSACTION_PORT.run',
    );
  });
});
