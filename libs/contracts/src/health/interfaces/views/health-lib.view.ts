import { Nullable } from '@acme-libs/toolkit';

type HealthLibDependencyStatus = 'ok' | 'error';

export interface IHealthLibLivenessView {
  status: 'ok';
  app: string;
  uptimeSeconds: number;
}

export interface IHealthLibDependencyView {
  status: HealthLibDependencyStatus;
  latencyMs: Nullable<number>;
}

export interface IHealthLibDependenciesView {
  database: IHealthLibDependencyView;
  cache: IHealthLibDependencyView;
}

export interface IHealthLibReadinessView {
  status: 'ready' | 'not-ready';
  dependencies: IHealthLibDependenciesView;
}
