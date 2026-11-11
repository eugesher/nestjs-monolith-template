import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { LocalStorageTransactionRunUseCase } from '../local-storage-transaction-run.use-case';

describe('LocalStorageTransactionRunUseCase', () => {
  let isActive: jest.Mock;
  let withTransaction: jest.Mock;
  let run: jest.Mock;
  let setHooks: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: LocalStorageTransactionRunUseCase;

  beforeEach(() => {
    isActive = jest.fn().mockReturnValue(false);
    withTransaction = jest.fn((work: () => Promise<unknown>) => work());
    run = jest.fn((work: () => Promise<unknown>) => work());
    setHooks = jest.fn();
    logger = makePinoLoggerMock();
    useCase = new LocalStorageTransactionRunUseCase(
      { isActive, withTransaction },
      { run, setHooks, getHooks: jest.fn() },
      logger as unknown as PinoLogger,
    );
  });

  it('joins the open transaction without a context or hooks of its own', async () => {
    isActive.mockReturnValue(true);

    const result = await useCase.execute(() => Promise.resolve('done'));

    expect(result).toBe('done');
    expect(withTransaction).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();
    expect(setHooks).not.toHaveBeenCalled();
  });

  it('opens a context with fresh hooks for the outermost run and runs them after the work', async () => {
    const outcomes: string[] = [];
    setHooks.mockImplementation((hooks: (() => Promise<void>)[]) => {
      hooks.push(() => Promise.resolve(void outcomes.push('hook')));
    });

    const result = await useCase.execute(() => Promise.resolve(void outcomes.push('work')));

    expect(result).toBeUndefined();
    expect(run).toHaveBeenCalledTimes(1);
    expect(outcomes).toEqual(['work', 'hook']);
  });

  it('logs a failed hook and runs the rest', async () => {
    const outcomes: string[] = [];
    setHooks.mockImplementation((hooks: (() => Promise<void>)[]) => {
      hooks.push(() => Promise.reject(new Error('cache is down')));
      hooks.push(() => Promise.resolve(void outcomes.push('hook 2')));
    });

    await useCase.execute(() => Promise.resolve());

    expect(outcomes).toEqual(['hook 2']);
    expect(logger.error).toHaveBeenCalledWith(
      { err: new Error('cache is down') },
      'After-commit hook failed',
    );
  });
});
