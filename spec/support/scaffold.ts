import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

export class Scaffold {
  private static readonly MANIFEST = path.join(ROOT, '.scaffold-manifest');

  private readonly createdFiles: string[] = [];
  private readonly createdDirectories: string[] = [];

  public static create(files: string[]): Scaffold {
    const scaffold = new Scaffold();

    files.forEach((file) => scaffold.write(file));

    return scaffold;
  }

  public static removeLeftovers(): void {
    if (!fs.existsSync(Scaffold.MANIFEST)) {
      return;
    }

    const entries = fs.readFileSync(Scaffold.MANIFEST, 'utf8').split('\n').filter(Boolean);

    [...entries].reverse().forEach((entry) => Scaffold.removeEntry(entry));
    fs.rmSync(Scaffold.MANIFEST);
  }

  public remove(): void {
    this.createdFiles.forEach((file) => fs.rmSync(file));
    [...this.createdDirectories].reverse().forEach((directory) => fs.rmdirSync(directory));
    Scaffold.forget([...this.createdFiles, ...this.createdDirectories]);
  }

  private static record(entry: string): void {
    fs.appendFileSync(Scaffold.MANIFEST, `${entry}\n`);
  }

  private static forget(removed: string[]): void {
    if (!fs.existsSync(Scaffold.MANIFEST)) {
      return;
    }

    const entries = fs.readFileSync(Scaffold.MANIFEST, 'utf8').split('\n').filter(Boolean);
    const left = entries.filter((entry) => !removed.includes(entry));

    if (left.length === 0) {
      fs.rmSync(Scaffold.MANIFEST);

      return;
    }

    fs.writeFileSync(Scaffold.MANIFEST, `${left.join('\n')}\n`);
  }

  private static removeEntry(entry: string): void {
    if (!fs.existsSync(entry)) {
      return;
    }

    if (!fs.statSync(entry).isDirectory()) {
      fs.rmSync(entry);

      return;
    }

    if (fs.readdirSync(entry).length === 0) {
      fs.rmdirSync(entry);
    }
  }

  private write(file: string): void {
    const absolute = path.join(ROOT, file);

    if (fs.existsSync(absolute)) {
      return;
    }

    this.makeDirectory(path.dirname(absolute));
    Scaffold.record(absolute);
    fs.writeFileSync(absolute, 'export const x = 1;\n');
    this.createdFiles.push(absolute);
  }

  private makeDirectory(directory: string): void {
    if (fs.existsSync(directory)) {
      return;
    }

    this.makeDirectory(path.dirname(directory));
    Scaffold.record(directory);
    fs.mkdirSync(directory);
    this.createdDirectories.push(directory);
  }
}
