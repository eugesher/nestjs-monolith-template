import { IHealthLibLivenessView, IHealthLibReadinessView } from '../interfaces';

export interface IHealthLibPort {
  handleLiveness(): IHealthLibLivenessView;
  handleReadiness(): Promise<IHealthLibReadinessView>;
}

export const HEALTH_LIB_PORT = Symbol('HEALTH_LIB_PORT');
