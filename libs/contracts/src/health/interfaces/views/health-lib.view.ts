import {
  HealthDependencyStatusEnum,
  HealthLivenessStatusEnum,
  HealthReadinessStatusEnum,
} from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

export interface IHealthLibLivenessView {
  status: HealthLivenessStatusEnum;
  app: string;
  uptimeSeconds: number;
}

export interface IHealthLibDependencyView {
  status: HealthDependencyStatusEnum;
  latencyMs: Nullable<number>;
}

export interface IHealthLibDependenciesView {
  database: IHealthLibDependencyView;
  cache: IHealthLibDependencyView;
}

export interface IHealthLibReadinessView {
  status: HealthReadinessStatusEnum;
  app: string;
  dependencies: IHealthLibDependenciesView;
}
