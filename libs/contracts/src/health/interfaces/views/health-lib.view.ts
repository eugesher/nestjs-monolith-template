type HealthLibDependencyStatus = 'ok' | 'error';

export interface IHealthLibLivenessView {
  status: 'ok';
  app: string;
  uptimeSeconds: number;
}

export interface IHealthLibDependencyView {
  status: HealthLibDependencyStatus;
  latencyMs?: number;
}

export interface IHealthLibReadinessView {
  status: 'ready' | 'not-ready';
  dependencies: Record<string, IHealthLibDependencyView>;
}
