import { Nullable } from '@acme-libs/toolkit';

import { HealthLibDependencyStatusEnum } from '../../enums/health-lib-dependency-status.enum';
import { HealthLibLivenessStatusEnum } from '../../enums/health-lib-liveness-status.enum';
import { HealthLibReadinessStatusEnum } from '../../enums/health-lib-readiness-status.enum';

export interface IHealthLibLivenessView {
  status: HealthLibLivenessStatusEnum;
  app: string;
  uptimeSeconds: number;
}

export interface IHealthLibDependencyView {
  status: HealthLibDependencyStatusEnum;
  latencyMs: Nullable<number>;
}

export interface IHealthLibDependenciesView {
  database: IHealthLibDependencyView;
  cache: IHealthLibDependencyView;
}

export interface IHealthLibReadinessView {
  status: HealthLibReadinessStatusEnum;
  dependencies: IHealthLibDependenciesView;
}
