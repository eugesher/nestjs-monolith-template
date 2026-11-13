import { existsSync } from 'fs';
import { dirname, join } from 'path';

export class EnvHelper {
  private static readonly ROOT_MARKER = 'nest-cli.json';

  public static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  public static appEnvFilePaths(app: string): string[] {
    const root = EnvHelper.findRoot(__dirname);

    if (!root) {
      return [];
    }

    const directory = join(root, 'env', 'apps', app);

    const file = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

    return [join(directory, file)];
  }

  private static findRoot(directory: string): string | undefined {
    const marker = join(directory, EnvHelper.ROOT_MARKER);

    if (existsSync(marker)) {
      return directory;
    }

    const parent = dirname(directory);

    if (parent === directory) {
      return undefined;
    }

    return EnvHelper.findRoot(parent);
  }
}
