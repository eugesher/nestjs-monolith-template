export class RequestBodyHelper {
  private static readonly MASKED_FIELDS = new Set(['password', 'email']);
  private static readonly MASK = '[REDACTED]';

  public static mask(body: unknown): unknown {
    if (Array.isArray(body)) {
      return body.map((item) => RequestBodyHelper.mask(item));
    }

    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const entries = Object.entries(body as Record<string, unknown>).map(([field, value]) => [
      field,
      RequestBodyHelper.MASKED_FIELDS.has(field)
        ? RequestBodyHelper.MASK
        : RequestBodyHelper.mask(value),
    ]);

    return Object.fromEntries(entries);
  }
}
