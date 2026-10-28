import { IHealthLibDependencyView } from '@acme-libs/contracts/health';

export interface IHealthLibDependencyProbePort {
  probeAll(): Promise<Record<string, IHealthLibDependencyView>>;
}

export const HEALTH_LIB_DEPENDENCY_PROBE_PORT = Symbol('HEALTH_LIB_DEPENDENCY_PROBE_PORT');
