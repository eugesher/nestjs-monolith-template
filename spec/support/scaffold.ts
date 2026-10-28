import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

export class Scaffold {
  private readonly createdFiles: string[] = [];
  private readonly createdDirectories: string[] = [];

  public static create(files: string[]): Scaffold {
    const scaffold = new Scaffold();

    files.forEach((file) => scaffold.write(file));

    return scaffold;
  }

  public remove(): void {
    this.createdFiles.forEach((file) => fs.rmSync(file));
    [...this.createdDirectories].reverse().forEach((directory) => fs.rmdirSync(directory));
  }

  private write(file: string): void {
    const absolute = path.join(ROOT, file);

    if (fs.existsSync(absolute)) {
      return;
    }

    this.makeDirectory(path.dirname(absolute));
    fs.writeFileSync(absolute, 'export const x = 1;\n');
    this.createdFiles.push(absolute);
  }

  private makeDirectory(directory: string): void {
    if (fs.existsSync(directory)) {
      return;
    }

    this.makeDirectory(path.dirname(directory));
    fs.mkdirSync(directory);
    this.createdDirectories.push(directory);
  }
}
