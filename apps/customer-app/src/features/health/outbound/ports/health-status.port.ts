import { IHealthStatusLivenessView, IHealthStatusReadinessView } from '../interfaces';

export interface IHealthStatusPort {
  liveness(): IHealthStatusLivenessView;
  readiness(): Promise<IHealthStatusReadinessView>;
}

export const HEALTH_STATUS_PORT = Symbol('HEALTH_STATUS_PORT');
