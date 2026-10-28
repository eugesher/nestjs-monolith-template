import { existsSync, readdirSync } from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const APPS = 'apps';
const SUBMODULES = 'modules';
const LAYERS = ['domain', 'outbound', 'application', 'infrastructure', 'presentation'];
const AREAS = {
  features: {
    folder: path.join('presentation', 'controllers'),
    suffix: '.controller.ts',
    missing: 'a feature must have a controller in presentation/controllers',
  },
  processors: {
    folder: 'presentation',
    suffix: '.consumer.ts',
    missing: 'a processor must have a consumer in presentation',
  },
};

export type AreaType = keyof typeof AREAS;

export interface IModuleFolder {
  relPath: string;
  name: string;
  area: AreaType;
  nested: boolean;
  files: string[];
  folders: string[];
  entryPoints: string[];
}

const entriesOf = (root: string, relPath: string): Pick<IModuleFolder, 'files' | 'folders'> => {
  if (!existsSync(path.join(root, relPath))) {
    return { files: [], folders: [] };
  }

  const entries = readdirSync(path.join(root, relPath), { withFileTypes: true });

  return {
    files: entries.filter((e) => e.isFile()).map((e) => e.name),
    folders: entries.filter((e) => e.isDirectory()).map((e) => e.name),
  };
};

function* modulesIn(
  root: string,
  relPath: string,
  area: AreaType,
  nested: boolean,
): Generator<IModuleFolder> {
  for (const name of entriesOf(root, relPath).folders) {
    const module = { relPath: path.join(relPath, name), name, area, nested };
    const entries = entriesOf(root, module.relPath);
    const entryPoints = entriesOf(root, path.join(module.relPath, AREAS[area].folder)).files.filter(
      (file) => file.endsWith(AREAS[area].suffix),
    );

    yield { ...module, ...entries, entryPoints };

    if (!nested && entries.folders.includes(SUBMODULES)) {
      yield* modulesIn(root, path.join(module.relPath, SUBMODULES), area, true);
    }
  }
}

export const appModules = (root = ROOT): IModuleFolder[] =>
  entriesOf(root, APPS).folders.flatMap((app) =>
    (Object.keys(AREAS) as AreaType[]).flatMap((area) => [
      ...modulesIn(root, path.join(APPS, app, 'src', area), area, false),
    ]),
  );

export const moduleKindViolationOf = ({
  name,
  area,
  nested,
  files,
  folders,
  entryPoints,
}: IModuleFolder): string | null => {
  const moduleFile = `${name}.module.ts`;
  const isAggregator = folders.includes(SUBMODULES);

  if (isAggregator && nested) {
    return 'a submodule may not aggregate modules of its own';
  }

  const allowedFolders = isAggregator ? [SUBMODULES] : LAYERS;
  const extras = [
    ...folders.filter((folder) => !allowedFolders.includes(folder)).map((folder) => `${folder}/`),
    ...files.filter((file) => file !== moduleFile),
  ];

  if (extras.length > 0) {
    const kind = isAggregator
      ? `an aggregator holds only ${SUBMODULES}/`
      : 'a regular module holds only layer folders';

    return `${kind} and ${moduleFile}, found: ${extras.join(', ')}`;
  }

  if (!files.includes(moduleFile)) {
    return `has no ${moduleFile}`;
  }

  return isAggregator || entryPoints.length > 0 ? null : AREAS[area].missing;
};

export const moduleKindViolations = (): { module: string; violation: string }[] =>
  appModules().flatMap((module) => {
    const violation = moduleKindViolationOf(module);

    return violation === null ? [] : [{ module: module.relPath, violation }];
  });
