import * as path from 'path';

import {
  existsInRepo,
  libraryProjects,
  libraryProjectsOfAliases,
  projects,
} from './support/nest-cli';

describe('nest-cli.json', () => {
  describe.each(Object.entries(projects))('project %s', (_, project) => {
    it('points at existing folders', () => {
      expect({ root: project.root, exists: existsInRepo(project.root) }).toEqual({
        root: project.root,
        exists: true,
      });
      expect({ sourceRoot: project.sourceRoot, exists: existsInRepo(project.sourceRoot) }).toEqual({
        sourceRoot: project.sourceRoot,
        exists: true,
      });
    });

    it('has an existing entry file', () => {
      const entry = path.join(project.sourceRoot, `${project.entryFile}.ts`);

      expect({ entry, exists: existsInRepo(entry) }).toEqual({ entry, exists: true });
    });

    it('has an existing tsconfig', () => {
      const tsconfig = project.compilerOptions.tsConfigPath;

      expect({ tsconfig, exists: existsInRepo(tsconfig) }).toEqual({ tsconfig, exists: true });
    });
  });

  it('has one library project per importable alias, rooted where the alias points', () => {
    expect(libraryProjects()).toEqual(libraryProjectsOfAliases());
  });
});
