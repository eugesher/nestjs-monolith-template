import { Inject, Injectable, type ClassProvider } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { HealthDependencyStatusEnum } from '@acme-libs/kernel';
import { CACHE_KEYS, CACHE_LIB_PORT, type ICacheLibPort } from '@acme-libs/contracts/cache';
import type {
  IHealthLibDependenciesView,
  IHealthLibDependencyView,
} from '@acme-libs/contracts/health';

import {
  HEALTH_LIB_DEPENDENCY_PROBE_PORT,
  type IHealthLibDependencyProbePort,
} from '../../outbound';

@Injectable()
export class HealthLibDependencyProbeAdapter implements IHealthLibDependencyProbePort {
  public static readonly provider: ClassProvider<IHealthLibDependencyProbePort> = {
    provide: HEALTH_LIB_DEPENDENCY_PROBE_PORT,
    useClass: HealthLibDependencyProbeAdapter,
  };

  private static readonly TIMEOUT_MS = 1000;

  constructor(
    @Inject(CACHE_LIB_PORT)
    private readonly cache: ICacheLibPort,
    private readonly dataSource: DataSource,
  ) {}

  public async probeAll(): Promise<IHealthLibDependenciesView> {
    const [database, cache] = await Promise.all([
      HealthLibDependencyProbeAdapter.timed(() => this.dataSource.query('SELECT 1')),
      HealthLibDependencyProbeAdapter.timed(() => this.cache.handleGet(CACHE_KEYS.healthProbe())),
    ]);

    return { database, cache };
  }

  private static async timed(probe: () => Promise<unknown>): Promise<IHealthLibDependencyView> {
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

      return { status: HealthDependencyStatusEnum.OK, latencyMs: Date.now() - startedAt };
    } catch {
      return { status: HealthDependencyStatusEnum.ERROR, latencyMs: null };
    } finally {
      clearTimeout(timer);
    }
  }
}
