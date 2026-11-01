import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsService } from 'nestjs-cls';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { ITransactionPort } from '@acme-libs/contracts/database';

@Injectable()
export class TransactionAdapter implements ITransactionPort {
  private static readonly AFTER_COMMIT_HOOKS = Symbol('TRANSACTION_AFTER_COMMIT_HOOKS');

  constructor(
    private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>,
    private readonly cls: ClsService,
    @InjectPinoLogger(TransactionAdapter.name)
    private readonly logger: PinoLogger,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.transactionHost.isTransactionActive()) {
      return await this.transactionHost.withTransaction(work);
    }

    return await this.cls.run({ ifNested: 'inherit' }, () => this.runOutermost(work));
  }

  public afterCommit(hook: () => Promise<void>): void {
    const hooks = this.cls.isActive()
      ? this.cls.get<(() => Promise<void>)[]>(TransactionAdapter.AFTER_COMMIT_HOOKS)
      : undefined;

    if (!this.transactionHost.isTransactionActive() || hooks === undefined) {
      throw new Error('afterCommit must be called inside TRANSACTION_PORT.run');
    }

    hooks.push(hook);
  }

  private async runOutermost<T>(work: () => Promise<T>): Promise<T> {
    const hooks: (() => Promise<void>)[] = [];

    this.cls.set(TransactionAdapter.AFTER_COMMIT_HOOKS, hooks);

    const result = await this.transactionHost.withTransaction(work);

    for (const hook of hooks) {
      await this.runHook(hook);
    }

    return result;
  }

  private async runHook(hook: () => Promise<void>): Promise<void> {
    try {
      await hook();
    } catch (error) {
      this.logger.error({ err: error }, 'After-commit hook failed');
    }
  }
}
