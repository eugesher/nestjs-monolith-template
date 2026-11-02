import { IHealthDependencyView } from './health-dependency.view';

export interface IHealthReadinessView {
  status: 'ready' | 'not-ready';
  dependencies: Record<string, IHealthDependencyView>;
}
