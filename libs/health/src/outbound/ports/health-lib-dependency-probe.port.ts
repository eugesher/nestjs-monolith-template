import { IHealthLibDependenciesView } from '@acme-libs/contracts/health';

export interface IHealthLibDependencyProbePort {
  probeAll(): Promise<IHealthLibDependenciesView>;
}

export const HEALTH_LIB_DEPENDENCY_PROBE_PORT = Symbol('HEALTH_LIB_DEPENDENCY_PROBE_PORT');
