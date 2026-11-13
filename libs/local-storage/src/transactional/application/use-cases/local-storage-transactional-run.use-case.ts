import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import {
  LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT,
  LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT,
  type ILocalStorageTransactionalContextPort,
  type ILocalStorageTransactionalHostPort,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionalRunUseCase {
  constructor(
    @Inject(LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT)
    private readonly host: ILocalStorageTransactionalHostPort,
    @Inject(LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT)
    private readonly context: ILocalStorageTransactionalContextPort,
    @InjectPinoLogger(LocalStorageTransactionalRunUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute<T>(work: () => Promise<T>): Promise<T> {
    if (this.host.isActive()) {
      return await this.host.withTransaction(work);
    }

    return await this.context.run(() => this.runOutermost(work));
  }

  private async runOutermost<T>(work: () => Promise<T>): Promise<T> {
    const hooks: (() => Promise<void>)[] = [];

    this.context.setHooks(hooks);

    const workResult = await this.host.withTransaction(work);

    for (const hook of hooks) {
      await this.runHook(hook);
    }

    return workResult;
  }

  private async runHook(hook: () => Promise<void>): Promise<void> {
    try {
      await hook();
    } catch (error) {
      this.logger.error({ err: error }, 'After-commit hook failed');
    }
  }
}
