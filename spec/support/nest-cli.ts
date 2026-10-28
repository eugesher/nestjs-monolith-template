import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

export interface INestProject {
  type: 'application' | 'library';
  root: string;
  sourceRoot: string;
  entryFile: string;
  compilerOptions: { tsConfigPath: string };
}

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(ROOT, file), 'utf8')) as T;

export const projects = readJson<{ projects: Record<string, INestProject> }>(
  'nest-cli.json',
).projects;
const aliases = readJson<{ compilerOptions: { paths: Record<string, string[]> } }>('tsconfig.json')
  .compilerOptions.paths;

export const existsInRepo = (relPath: string): boolean => existsSync(path.join(ROOT, relPath));

const projectOfAlias = (alias: string): string | null => {
  const core = /^@acme-core\/(modules|contracts)\/([^/]+)$/.exec(alias);
  const libContracts = /^@acme-libs\/contracts\/([^/]+)$/.exec(alias);
  const lib = /^@acme-libs\/([^/]+)$/.exec(alias);

  if (core) {
    return `core-${core[1]}-${core[2]}`;
  }

  if (alias === '@acme-core/entities') {
    return 'core-entities';
  }

  if (libContracts) {
    return `contracts-${libContracts[1]}`;
  }

  return lib ? lib[1] : null;
};

export const libraryProjectsOfAliases = (): [string, string][] =>
  Object.entries(aliases)
    .map(([alias, [target]]) => [projectOfAlias(alias), path.normalize(target)])
    .filter((entry): entry is [string, string] => entry[0] !== null)
    .sort(([a], [b]) => a.localeCompare(b));

export const libraryProjects = (): [string, string][] =>
  Object.entries(projects)
    .filter(([, project]) => project.type === 'library')
    .map(([name, project]): [string, string] => [name, project.sourceRoot])
    .sort(([a], [b]) => a.localeCompare(b));
