import { Global, Module, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { DataSource, type EntityManager } from 'typeorm';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { LocalStorageTransactionalModule } from '../local-storage-transactional.module';

describe('LocalStorageTransactionalModule', () => {
  let outcomes: string[];
  let dataSource: { manager: EntityManager; transaction: jest.Mock };
  let error: jest.SpyInstance;
  let context: INestApplicationContext;
  let port: ITransactionPort;
  let transactionHost: TransactionHost<TransactionalAdapterTypeOrm>;

  beforeEach(async () => {
    outcomes = [];
    error = jest.spyOn(PinoLogger.prototype, 'error');
    dataSource = {
      manager: { name: 'default' } as unknown as EntityManager,
      transaction: jest.fn(
        async (_isolation: unknown, work: (manager: EntityManager) => Promise<unknown>) => {
          try {
            const result = await work({ name: 'transaction' } as unknown as EntityManager);

            outcomes.push('commit');

            return result;
          } catch (failure) {
            outcomes.push('rollback');

            throw failure;
          }
        },
      ),
    };

    @Global()
    @Module({
      exports: [DataSource],
      providers: [{ provide: DataSource, useValue: dataSource }],
    })
    class DataSourceModule {}

    @Module({
      imports: [
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        ClsModule.forRoot({ global: true }),
        DataSourceModule,
        LocalStorageTransactionalModule.forRoot(),
      ],
    })
    class TestModule {}

    context = await NestFactory.createApplicationContext(TestModule, { logger: false });
    port = context.get(TRANSACTION_PORT);
    transactionHost = context.get(TransactionHost);
  });

  afterEach(async () => {
    await context.close();
    jest.restoreAllMocks();
    Object.assign(PinoLogger, { root: undefined });
  });

  it('runs the work on the transaction manager, commits and returns its result', async () => {
    const result = await port.run(() => Promise.resolve(transactionHost.tx));

    expect(result).toEqual({ name: 'transaction' });
    expect(outcomes).toEqual(['commit']);
  });

  it('rolls back and rethrows when the work fails', async () => {
    const run = port.run(() => Promise.reject(new Error('work failed')));

    await expect(run).rejects.toThrow('work failed');
    expect(outcomes).toEqual(['rollback']);
  });

  it('reuses the open transaction for a nested run', async () => {
    const managers = await port.run(async () => {
      const outer = transactionHost.tx;
      const inner = await port.run(() => Promise.resolve(transactionHost.tx));

      return [outer, inner];
    });

    expect(managers[0]).toBe(managers[1]);
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(outcomes).toEqual(['commit']);
  });

  it('falls back to the default manager outside a run', () => {
    expect(transactionHost.tx).toEqual({ name: 'default' });
  });

  describe('afterCommit', () => {
    it('runs the hooks after the commit, in the order they were added', async () => {
      await port.run(() => {
        port.afterCommit(() => Promise.resolve(void outcomes.push('hook 1')));
        port.afterCommit(() => Promise.resolve(void outcomes.push('hook 2')));

        return Promise.resolve();
      });

      expect(outcomes).toEqual(['commit', 'hook 1', 'hook 2']);
    });

    it('drops the hooks of a transaction that rolls back', async () => {
      const run = port.run(() => {
        port.afterCommit(() => Promise.resolve(void outcomes.push('hook')));

        return Promise.reject(new Error('work failed'));
      });

      await expect(run).rejects.toThrow('work failed');
      expect(outcomes).toEqual(['rollback']);
    });

    it('runs the hooks of a nested run once, after the commit of the outer one', async () => {
      await port.run(async () => {
        await port.run(() => {
          port.afterCommit(() => Promise.resolve(void outcomes.push('inner hook')));

          return Promise.resolve();
        });

        outcomes.push('outer work');
      });

      expect(outcomes).toEqual(['outer work', 'commit', 'inner hook']);
    });

    it('keeps the hooks of one run out of the next one', async () => {
      await port.run(() => {
        port.afterCommit(() => Promise.resolve(void outcomes.push('first hook')));

        return Promise.resolve();
      });
      await port.run(() => Promise.resolve());

      expect(outcomes).toEqual(['commit', 'first hook', 'commit']);
    });

    it('logs a failed hook, runs the rest and answers the result of the work', async () => {
      const result = await port.run(() => {
        port.afterCommit(() => Promise.reject(new Error('cache is down')));
        port.afterCommit(() => Promise.resolve(void outcomes.push('hook 2')));

        return Promise.resolve('done');
      });

      expect(result).toBe('done');
      expect(outcomes).toEqual(['commit', 'hook 2']);
      expect(error).toHaveBeenCalledWith(
        { err: new Error('cache is down') },
        'After-commit hook failed',
      );
    });

    it('refuses a hook outside a run', () => {
      expect(() => port.afterCommit(() => Promise.resolve())).toThrow(
        'afterCommit must be called inside TRANSACTION_PORT.run',
      );
    });
  });
});
