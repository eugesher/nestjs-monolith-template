interface IHealthStatusReadinessViewDependency {
  status: 'ok' | 'error';
  latencyMs?: number;
}

export interface IHealthStatusLivenessView {
  status: 'ok';
  app: string;
  uptimeSeconds: number;
}

export interface IHealthStatusReadinessView {
  status: 'ready' | 'not-ready';
  dependencies: Record<string, IHealthStatusReadinessViewDependency>;
}
