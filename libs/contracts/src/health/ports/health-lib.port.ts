import { IHealthLibLivenessView, IHealthLibReadinessView } from '../interfaces';

export interface IHealthLibPort {
  liveness(): IHealthLibLivenessView;
  readiness(): Promise<IHealthLibReadinessView>;
}

export const HEALTH_LIB_PORT = Symbol('HEALTH_LIB_PORT');
