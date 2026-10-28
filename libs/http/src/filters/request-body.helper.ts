export class RequestBodyHelper {
  private static readonly SECRET_FIELDS = new Set([
    'password',
    'currentPassword',
    'newPassword',
    'refreshToken',
  ]);
  private static readonly MASK = '[REDACTED]';

  public static mask(body: unknown): unknown {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return body;
    }

    const entries = Object.entries(body as Record<string, unknown>).map(([field, value]) => [
      field,
      RequestBodyHelper.SECRET_FIELDS.has(field) ? RequestBodyHelper.MASK : value,
    ]);

    return Object.fromEntries(entries);
  }
}
