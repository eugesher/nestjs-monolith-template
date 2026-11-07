import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  CACHE_LIB_STORE_PORT,
  CACHE_LIB_TRACER_PORT,
  type ICacheLibStorePort,
  type ICacheLibTracerPort,
} from '../../outbound';

@Injectable()
export class CacheLibDelByPrefixUseCase {
  constructor(
    @Inject(CACHE_LIB_STORE_PORT)
    private readonly store: ICacheLibStorePort,
    @Inject(CACHE_LIB_TRACER_PORT)
    private readonly tracer: ICacheLibTracerPort,
    @InjectPinoLogger(CacheLibDelByPrefixUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(prefix: string): Promise<number> {
    return await this.tracer.span({
      name: 'cache.delByPrefix',
      attributes: { 'cache.prefix': prefix },
      work: async (attributes) => {
        try {
          const unlinked = await this.store.unlinkByPrefix(prefix);

          attributes['cache.keys_unlinked'] = unlinked;

          return unlinked;
        } catch (error) {
          this.logger.warn(
            { err: error, prefix },
            'Cache invalidation failed, entries expire on TTL',
          );

          return 0;
        }
      },
    });
  }
}
