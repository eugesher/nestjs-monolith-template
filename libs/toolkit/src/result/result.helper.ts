import { Result } from './result.type';

export class ResultHelper {
  public static ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  }

  public static err<E>(error: E): Result<never, E> {
    return { ok: false, error };
  }
}
