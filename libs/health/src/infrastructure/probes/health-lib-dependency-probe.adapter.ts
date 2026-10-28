import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';
import { IHealthLibDependencyView } from '@acme-libs/contracts/health';
import { IHealthLibDependencyProbePort } from '../../outbound';

@Injectable()
export class HealthLibDependencyProbeAdapter implements IHealthLibDependencyProbePort {
  private static readonly TIMEOUT_MS = 1000;

  constructor(
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
    private readonly dataSource: DataSource,
  ) {}

  public async probeAll(): Promise<Record<string, IHealthLibDependencyView>> {
    const [database, cache] = await Promise.all([
      this.timed(() => this.dataSource.query('SELECT 1')),
      this.timed(() => this.cache.get(CACHE_KEYS.healthProbe())),
    ]);

    return { database, cache };
  }

  private async timed(probe: () => Promise<unknown>): Promise<IHealthLibDependencyView> {
    const startedAt = Date.now();
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('probe timed out')),
        HealthLibDependencyProbeAdapter.TIMEOUT_MS,
      );
    });

    try {
      await Promise.race([probe(), timeout]);

      return { status: 'ok', latencyMs: Date.now() - startedAt };
    } catch {
      return { status: 'error' };
    } finally {
      clearTimeout(timer);
    }
  }
}
