export class LedgerRecordHelper {
  private static readonly EXPLICIT_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/;

  public static parseInstant(value: string, field: string): Date {
    if (!LedgerRecordHelper.EXPLICIT_ZONE.test(value)) {
      throw new Error(
        `${field} must be an ISO-8601 instant with an explicit timezone offset, got ${value}`,
      );
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`${field} is not a valid instant: ${value}`);
    }

    return parsed;
  }
}
