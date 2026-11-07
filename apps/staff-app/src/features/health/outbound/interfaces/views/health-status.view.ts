import { Nullable } from '@acme-libs/toolkit';

export interface IHealthStatusLivenessView {
  status: 'ok';
  app: string;
  uptimeSeconds: number;
}

export interface IHealthStatusDependencyView {
  status: 'ok' | 'error';
  latencyMs: Nullable<number>;
}

export interface IHealthStatusReadinessView {
  status: 'ready' | 'not-ready';
  dependencies: {
    database: IHealthStatusDependencyView;
    cache: IHealthStatusDependencyView;
  };
}
