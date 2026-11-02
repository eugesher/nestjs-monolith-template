import { IHealthLivenessView, IHealthReadinessView } from '../interfaces';

export interface IHealthStatusPort {
  liveness(): IHealthLivenessView;
  readiness(): Promise<IHealthReadinessView>;
}

export const HEALTH_STATUS_PORT = Symbol('HEALTH_STATUS_PORT');
