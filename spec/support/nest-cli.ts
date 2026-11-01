import { existsSync, readdirSync, readFileSync } from 'fs';
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
  const core = /^@acme-core-(modules|contracts)\/([^/]+)$/.exec(alias);
  const libContracts = /^@acme-libs-contracts\/([^/]+)$/.exec(alias);
  const lib = /^@acme-libs-([^/]+)$/.exec(alias);

  if (core) {
    return `core-${core[1]}-${core[2]}`;
  }

  if (alias === '@acme-core-entities') {
    return 'core-entities';
  }

  if (libContracts) {
    return `contracts-${libContracts[1]}`;
  }

  return lib ? lib[1] : null;
};

const expandAlias = ([alias, [target]]: [string, string[]]): [string, string][] => {
  if (!alias.endsWith('/*')) {
    return [[alias, target]];
  }

  const root = target.slice(0, -'/*'.length);
  const folders = readdirSync(path.join(ROOT, root), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return folders.map((folder) => [`${alias.slice(0, -'*'.length)}${folder}`, `${root}/${folder}`]);
};

export const libraryProjectsOfAliases = (): [string, string][] =>
  Object.entries(aliases)
    .flatMap(expandAlias)
    .map(([alias, target]): [string | null, string] => [
      projectOfAlias(alias),
      path.normalize(target),
    ])
    .filter((entry): entry is [string, string] => entry[0] !== null)
    .sort(([a], [b]) => a.localeCompare(b));

export const libraryProjects = (): [string, string][] =>
  Object.entries(projects)
    .filter(([, project]) => project.type === 'library')
    .map(([name, project]): [string, string] => [name, project.sourceRoot])
    .sort(([a], [b]) => a.localeCompare(b));
