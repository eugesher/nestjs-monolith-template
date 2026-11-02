export interface IHealthDependencyView {
  status: 'ok' | 'error';
  latencyMs?: number;
}
