export class EnvHelper {
  public static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}
