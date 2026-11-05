export interface IHealthStatusLivenessView {
  status: 'ok';
  app: string;
  uptimeSeconds: number;
}

export interface IHealthStatusReadinessView {
  status: 'ready' | 'not-ready';
  dependencies: Record<string, { status: 'ok' | 'error'; latencyMs?: number }>;
}
