import { Injectable } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';
import {
  ICacheLibPort,
  ICacheLibSetCommand,
  ICacheLibWrapCommand,
} from '@acme-libs/contracts/cache';

import {
  CacheLibDelByPrefixUseCase,
  CacheLibDelUseCase,
  CacheLibGetUseCase,
  CacheLibSetUseCase,
  CacheLibWrapUseCase,
} from '../application';

@Injectable()
export class CacheLibFacade implements ICacheLibPort {
  constructor(
    private readonly get: CacheLibGetUseCase,
    private readonly set: CacheLibSetUseCase,
    private readonly del: CacheLibDelUseCase,
    private readonly delByPrefix: CacheLibDelByPrefixUseCase,
    private readonly wrap: CacheLibWrapUseCase,
  ) {}

  public async handleGet<T>(key: string): Promise<Maybe<T>> {
    return await this.get.execute<T>(key);
  }

  public async handleSet<T>(command: ICacheLibSetCommand<T>): Promise<void> {
    await this.set.execute(command);
  }

  public async handleDel(key: string): Promise<void> {
    await this.del.execute(key);
  }

  public async handleDelByPrefix(prefix: string): Promise<number> {
    return await this.delByPrefix.execute(prefix);
  }

  public async handleWrap<T>(command: ICacheLibWrapCommand<T>): Promise<T> {
    return await this.wrap.execute(command);
  }
}
