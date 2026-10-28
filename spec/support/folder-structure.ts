import { existsSync, readdirSync } from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const SKIPPED = new Set(['node_modules', 'dist']);
const BARREL = 'index.ts';
const SPEC = 'spec';
const REPOSITORIES = 'repositories';
const REPOSITORY_BASE = 'base';

export interface IFolder {
  relPath: string;
  files: string[];
  folders: string[];
}

function* walk(relPath: string): Generator<IFolder> {
  const entries = readdirSync(path.join(ROOT, relPath), { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  const folders = entries.filter((e) => e.isDirectory() && !SKIPPED.has(e.name)).map((e) => e.name);

  yield { relPath, files, folders };

  for (const folder of folders) {
    yield* walk(path.join(relPath, folder));
  }
}

const countsAsSubfolder = (relPath: string, folder: string): boolean =>
  folder !== SPEC && !(path.basename(relPath) === REPOSITORIES && folder === REPOSITORY_BASE);

export const folderStructureViolationOf = ({ relPath, files, folders }: IFolder): string | null => {
  if (files.includes(BARREL)) {
    const besideBarrel = files.filter((file) => file !== BARREL);

    return besideBarrel.length > 0
      ? `has a barrel, so only folders may sit next to it, found files: ${besideBarrel.join(', ')}`
      : null;
  }

  return folders.some((folder) => countsAsSubfolder(relPath, folder)) && files.length > 1
    ? `has folders, so at most one file is allowed next to them, found: ${files.join(', ')}`
    : null;
};

export const folderStructureViolations = (top: string): { folder: string; violation: string }[] =>
  (existsSync(path.join(ROOT, top)) ? [...walk(top)] : []).flatMap((folder) => {
    const violation = folderStructureViolationOf(folder);

    return violation === null ? [] : [{ folder: folder.relPath, violation }];
  });
