export class IdempotencyPurgeHelper {
  private static readonly MINUTE_MS = 60 * 1000;
  private static readonly HOUR_MS = 60 * IdempotencyPurgeHelper.MINUTE_MS;

  public static expiryCutoff(now: Date, ttlHours: number): Date {
    const cutoffMs = now.getTime() - ttlHours * IdempotencyPurgeHelper.HOUR_MS;

    return new Date(cutoffMs);
  }

  public static inFlightCutoff(now: Date, inFlightTtlMinutes: number): Date {
    const cutoffMs = now.getTime() - inFlightTtlMinutes * IdempotencyPurgeHelper.MINUTE_MS;

    return new Date(cutoffMs);
  }
}
