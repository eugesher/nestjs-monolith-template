import { QueryFailedError } from 'typeorm';

interface IMysqlDriverError {
  errno?: number;
  code?: string;
}

export class MysqlErrorHelper {
  private static readonly DUPLICATE_ENTRY_ERRNO = 1062;

  public static isDuplicateKey(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as Error & IMysqlDriverError;

    return (
      driverError.errno === MysqlErrorHelper.DUPLICATE_ENTRY_ERRNO ||
      driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
