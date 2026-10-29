import { lintConfigFor } from '../support/lint';

describe('awaited arguments', () => {
  it('an awaited call may NOT be passed straight to another call', async () => {
    await expect({
      file: 'apps/staff-app/src/features/item/application/use-cases/__fixture__.ts',
      code:
        'declare const find: () => Promise<number>;' +
        'declare const save: (value: number) => void;' +
        'export const run = async () => save(await find());',
    }).toBreakRule('no-restricted-syntax');
  });

  it('an awaited call may NOT be passed straight to a constructor', async () => {
    await expect({
      file: 'apps/staff-app/src/features/item/application/use-cases/__fixture__.ts',
      code:
        'declare const find: () => Promise<number[]>;' +
        'export const run = async () => new Set(await find());',
    }).toBreakRule('no-restricted-syntax');
  });

  it('an awaited call may NOT be mapped inside the argument of another call', async () => {
    await expect({
      file: 'apps/staff-app/src/features/item/application/use-cases/__fixture__.ts',
      code:
        'declare const find: () => Promise<number[]>;' +
        'export const run = async () => new Set((await find()).map((n) => n + 1));',
    }).toBreakRule('no-restricted-syntax');
  });

  it('an awaited result MAY be passed through a const', async () => {
    await expect({
      file: 'apps/staff-app/src/features/item/application/use-cases/__fixture__.ts',
      code:
        'declare const find: () => Promise<number>;' +
        'declare const save: (value: number) => void;' +
        'export const run = async () => { const value = await find(); save(value); };',
    }).toPassArchitectureLint();
  });

  it('a callback argument MAY await inside its own body', async () => {
    await expect({
      file: 'apps/staff-app/src/features/item/application/use-cases/__fixture__.ts',
      code:
        'declare const find: (n: number) => Promise<number>;' +
        'export const run = () => Promise.all([1, 2].map(async (n) => await find(n)));',
    }).toPassArchitectureLint();
  });

  it('a spec MAY pass an awaited call straight to expect', async () => {
    await expect({
      file: 'apps/staff-app/src/features/item/application/use-cases/spec/__fixture__.spec.ts',
      code:
        'declare const find: () => Promise<number>;' +
        'it("finds", async () => expect(await find()).toBe(1));',
    }).toPassArchitectureLint();
  });

  it('a spec keeps exactly the layer barrel selectors of the root config', async () => {
    const source = (await lintConfigFor(
      'apps/staff-app/src/features/item/application/use-cases/__fixture__.ts',
    )) as { rules: Record<string, [unknown, ...object[]]> };
    const spec = (await lintConfigFor(
      'apps/staff-app/src/features/item/application/use-cases/spec/__fixture__.spec.ts',
    )) as { rules: Record<string, [unknown, ...object[]]> };
    const [, ...sourceEntries] = source.rules['no-restricted-syntax'];
    const [, ...specEntries] = spec.rules['no-restricted-syntax'];

    expect(specEntries).toEqual(
      sourceEntries.filter((entry) => !JSON.stringify(entry).includes('awaited')),
    );
    expect(specEntries.length).toBe(4);
  });
});
