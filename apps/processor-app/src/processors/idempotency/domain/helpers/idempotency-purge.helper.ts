export class IdempotencyPurgeHelper {
  private static readonly HOUR_MS = 60 * 60 * 1000;

  public static expiryCutoff(now: Date, ttlHours: number): Date {
    const cutoffMs = now.getTime() - ttlHours * IdempotencyPurgeHelper.HOUR_MS;

    return new Date(cutoffMs);
  }
}
