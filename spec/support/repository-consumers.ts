import { existsSync, readdirSync, readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const ROOT = path.resolve(__dirname, '../..');
const TOPS = ['apps', 'core', 'libs'];
const SKIPPED = new Set(['node_modules', 'dist', 'spec', 'test']);
const REPOSITORY_TYPE = /^I?(\w+)Repository(Port)?$/;
const CONSUMER_SUFFIX = /(UseCase|Service|Facade)$/;
const CRUD_USE_CASE = /^(\w+)(GetMany|GetOne|CreateOne|UpdateOne|DeleteOne)UseCase$/;
const PROPERTY = 'repository';

export interface IRepositoryParam {
  name: string;
  type: string;
}

export interface IRepositoryConsumer {
  name: string;
  file: string;
  params: IRepositoryParam[];
}

function* sourceFiles(relPath: string): Generator<string> {
  const entries = readdirSync(path.join(ROOT, relPath), { withFileTypes: true });

  for (const entry of entries) {
    const child = path.join(relPath, entry.name);

    if (entry.isDirectory() && !SKIPPED.has(entry.name)) {
      yield* sourceFiles(child);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      yield child;
    }
  }
}

const consumersOf = (file: string): IRepositoryConsumer[] => {
  const code = readFileSync(path.join(ROOT, file), 'utf8');
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  const consumers: IRepositoryConsumer[] = [];

  source.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) {
      return;
    }

    const constructor = node.members.find(ts.isConstructorDeclaration);
    const params = (constructor?.parameters ?? [])
      .map((param) => {
        const name = param.name.getText(source);
        const type = param.type?.getText(source) ?? '';

        return { name, type };
      })
      .filter(({ type }) => REPOSITORY_TYPE.test(type));

    if (params.length > 0) {
      consumers.push({ name: node.name.text, file, params });
    }
  });

  return consumers;
};

export const repositoryConsumers = (): IRepositoryConsumer[] =>
  TOPS.filter((top) => existsSync(path.join(ROOT, top))).flatMap((top) => {
    const files = [...sourceFiles(top)];

    return files.flatMap(consumersOf);
  });

const expectedRepositoryOf = (consumer: string): string => {
  const crud = CRUD_USE_CASE.exec(consumer);

  return crud ? `${crud[1]}Crud` : consumer.replace(CONSUMER_SUFFIX, '');
};

export const repositoryConsumerViolations = (consumers: IRepositoryConsumer[]): string[] => {
  const violations: string[] = [];
  const owners = new Map<string, string[]>();

  for (const { name, file, params } of consumers) {
    const [param] = params;
    const [, repository] = REPOSITORY_TYPE.exec(param.type) ?? [];
    const expected = expectedRepositoryOf(name);
    const scope = file.split(/[\\/]/).slice(0, 2).join('/');
    const key = `${scope} ${param.type}`;
    const owned = owners.get(key) ?? [];

    owners.set(key, [...owned, name]);

    if (params.length > 1) {
      violations.push(`${name} has ${params.length} repositories, at most one is allowed`);
    }

    if (param.name !== PROPERTY) {
      violations.push(`${name} keeps its repository in "${param.name}", expected "${PROPERTY}"`);
    }

    if (repository !== expected) {
      violations.push(`${name} uses ${param.type}, expected the repository of ${expected}`);
    }
  }

  for (const [key, names] of owners) {
    if (names.length > 1 && !names.every((name) => CRUD_USE_CASE.test(name))) {
      const [, type] = key.split(' ');

      violations.push(`${type} is shared by ${names.join(', ')}`);
    }
  }

  return violations;
};
