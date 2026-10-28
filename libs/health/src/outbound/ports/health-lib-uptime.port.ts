export interface IHealthLibUptimePort {
  seconds(): number;
}

export const HEALTH_LIB_UPTIME_PORT = Symbol('HEALTH_LIB_UPTIME_PORT');
