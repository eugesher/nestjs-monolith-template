import {
  HealthDependencyStatusEnum,
  HealthLivenessStatusEnum,
  HealthReadinessStatusEnum,
} from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

export interface IHealthStatusLivenessView {
  status: HealthLivenessStatusEnum;
  app: string;
  uptimeSeconds: number;
}

export interface IHealthStatusDependencyView {
  status: HealthDependencyStatusEnum;
  latencyMs: Nullable<number>;
}

export interface IHealthStatusReadinessView {
  status: HealthReadinessStatusEnum;
  app: string;
  dependencies: {
    database: IHealthStatusDependencyView;
    cache: IHealthStatusDependencyView;
  };
}
