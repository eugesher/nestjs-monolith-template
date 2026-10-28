import { folderStructureViolationOf, folderStructureViolations } from './support/folder-structure';

describe('folder structure', () => {
  it.each(['apps', 'core', 'libs'])(
    'every folder under %s follows the barrel / files / folders rule',
    (top) => {
      expect(folderStructureViolations(top)).toEqual([]);
    },
  );

  describe('the rule itself', () => {
    it.each([
      ['a barrel with folders only', { relPath: 'x', files: ['index.ts'], folders: ['a', 'b'] }],
      ['files only', { relPath: 'x', files: ['a.ts', 'b.ts'], folders: [] }],
      ['folders and one file', { relPath: 'x', files: ['x.module.ts'], folders: ['a', 'b'] }],
      ['folders only', { relPath: 'x', files: [], folders: ['a'] }],
      [
        'files with their spec folder',
        { relPath: 'x', files: ['a.ts', 'b.ts'], folders: ['spec'] },
      ],
      [
        'repositories with their base folder',
        {
          relPath: 'x/repositories',
          files: ['a.repository.ts', 'b.repository.ts'],
          folders: ['base'],
        },
      ],
    ])('accepts %s', (_, folder) => {
      expect(folderStructureViolationOf(folder)).toBeNull();
    });

    it.each([
      [
        'a barrel with a file next to it',
        { relPath: 'x', files: ['index.ts', 'a.ts'], folders: [] },
      ],
      ['folders with two files', { relPath: 'x', files: ['a.ts', 'b.ts'], folders: ['a'] }],
      [
        'folders with two files besides a spec folder',
        { relPath: 'x', files: ['a.ts', 'b.ts'], folders: ['a', 'spec'] },
      ],
      [
        'a base folder outside repositories',
        { relPath: 'x/services', files: ['a.ts', 'b.ts'], folders: ['base'] },
      ],
    ])('rejects %s', (_, folder) => {
      expect(folderStructureViolationOf(folder)).not.toBeNull();
    });
  });
});
