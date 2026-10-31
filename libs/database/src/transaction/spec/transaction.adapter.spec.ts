import { INestApplicationContext, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ClsPluginTransactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { getLoggerToken } from 'nestjs-pino';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionAdapter } from '../transaction.adapter';

describe('TransactionAdapter', () => {
  let outcomes: string[];
  let dataSource: { manager: EntityManager; transaction: jest.Mock };
  let context: INestApplicationContext;
  let adapter: TransactionAdapter;
  let txHost: TransactionHost<TransactionalAdapterTypeOrm>;
  let logger: { error: jest.Mock };

  beforeEach(async () => {
    outcomes = [];
    logger = { error: jest.fn() };
    dataSource = {
      manager: { name: 'default' } as unknown as EntityManager,
      transaction: jest.fn(
        async (_isolation: unknown, work: (manager: EntityManager) => Promise<unknown>) => {
          try {
            const result = await work({ name: 'transaction' } as unknown as EntityManager);

            outcomes.push('commit');

            return result;
          } catch (error) {
            outcomes.push('rollback');

            throw error;
          }
        },
      ),
    };

    @Module({
      providers: [{ provide: DataSource, useValue: dataSource }],
      exports: [DataSource],
    })
    class DataSourceModule {}

    @Module({
      imports: [
        ClsModule.forRoot({
          global: true,
          plugins: [
            new ClsPluginTransactional({
              imports: [DataSourceModule],
              adapter: new TransactionalAdapterTypeOrm({ dataSourceToken: DataSource }),
            }),
          ],
        }),
      ],
      providers: [
        TransactionAdapter,
        { provide: getLoggerToken(TransactionAdapter.name), useValue: logger },
      ],
    })
    class TestModule {}

    context = await NestFactory.createApplicationContext(TestModule, { logger: false });
    adapter = context.get(TransactionAdapter);
    txHost = context.get(TransactionHost);
  });

  afterEach(async () => {
    await context.close();
  });

  it('runs the work on the transaction manager, commits and returns its result', async () => {
    const result = await adapter.run(() => Promise.resolve(txHost.tx));

    expect(result).toEqual({ name: 'transaction' });
    expect(outcomes).toEqual(['commit']);
  });

  it('rolls back and rethrows when the work fails', async () => {
    const run = adapter.run(() => Promise.reject(new Error('work failed')));

    await expect(run).rejects.toThrow('work failed');
    expect(outcomes).toEqual(['rollback']);
  });

  it('reuses the open transaction for a nested run', async () => {
    const managers = await adapter.run(async () => {
      const outer = txHost.tx;
      const inner = await adapter.run(() => Promise.resolve(txHost.tx));

      return [outer, inner];
    });

    expect(managers[0]).toBe(managers[1]);
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(outcomes).toEqual(['commit']);
  });

  it('falls back to the default manager outside a run', () => {
    expect(txHost.tx).toEqual({ name: 'default' });
  });

  describe('afterCommit', () => {
    it('runs the hooks after the commit, in the order they were added', async () => {
      await adapter.run(() => {
        adapter.afterCommit(() => Promise.resolve(void outcomes.push('hook 1')));
        adapter.afterCommit(() => Promise.resolve(void outcomes.push('hook 2')));

        return Promise.resolve();
      });

      expect(outcomes).toEqual(['commit', 'hook 1', 'hook 2']);
    });

    it('drops the hooks of a transaction that rolls back', async () => {
      const run = adapter.run(() => {
        adapter.afterCommit(() => Promise.resolve(void outcomes.push('hook')));

        return Promise.reject(new Error('work failed'));
      });

      await expect(run).rejects.toThrow('work failed');
      expect(outcomes).toEqual(['rollback']);
    });

    it('runs the hooks of a nested run once, after the commit of the outer one', async () => {
      await adapter.run(async () => {
        await adapter.run(() => {
          adapter.afterCommit(() => Promise.resolve(void outcomes.push('inner hook')));

          return Promise.resolve();
        });

        outcomes.push('outer work');
      });

      expect(outcomes).toEqual(['outer work', 'commit', 'inner hook']);
    });

    it('keeps the hooks of one run out of the next one', async () => {
      await adapter.run(() => {
        adapter.afterCommit(() => Promise.resolve(void outcomes.push('first hook')));

        return Promise.resolve();
      });
      await adapter.run(() => Promise.resolve());

      expect(outcomes).toEqual(['commit', 'first hook', 'commit']);
    });

    it('logs a failed hook, runs the rest and answers the result of the work', async () => {
      const result = await adapter.run(() => {
        adapter.afterCommit(() => Promise.reject(new Error('cache is down')));
        adapter.afterCommit(() => Promise.resolve(void outcomes.push('hook 2')));

        return Promise.resolve('done');
      });

      expect(result).toBe('done');
      expect(outcomes).toEqual(['commit', 'hook 2']);
      expect(logger.error).toHaveBeenCalledWith(
        { err: new Error('cache is down') },
        'After-commit hook failed',
      );
    });

    it('refuses a hook outside a run', () => {
      expect(() => adapter.afterCommit(() => Promise.resolve())).toThrow(
        'afterCommit must be called inside TRANSACTION_PORT.run',
      );
    });
  });
});
