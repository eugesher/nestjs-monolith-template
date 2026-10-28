import { ESLint } from 'eslint';
import { resolve as resolveImport } from 'eslint-import-resolver-typescript';
import * as path from 'path';
import typescriptEslint from 'typescript-eslint';

interface ILintFixture {
  file: string;
  code: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Matchers<R> {
      toBreakRule(ruleId: string): Promise<R>;
      toPassArchitectureLint(): Promise<R>;
      toResolve(): R;
    }
  }
}

const ROOT = path.resolve(__dirname, '../..');
const TSCONFIG = path.join(ROOT, 'tsconfig.json');
const RESOLVING_FILE = path.join(ROOT, 'apps/admin-api/src/features/__fixture__.ts');

const ARCHITECTURE_RULES = [
  'boundaries/dependencies',
  'boundaries/no-unknown-dependencies',
  'boundaries/no-unknown-files',
  'no-restricted-globals',
  'no-restricted-imports',
  'no-restricted-syntax',
];

const eslint = new ESLint({
  cwd: ROOT,
  overrideConfig: typescriptEslint.configs.disableTypeChecked,
});

const unresolvedImportsOf = ({ file, code }: ILintFixture): string[] =>
  [...code.matchAll(/from ["']([^"']+)["']|import\(["']([^"']+)["']\)/g)]
    .map((match) => match[1] ?? match[2])
    .filter((source) => !resolveImport(source, path.join(ROOT, file), { project: TSCONFIG }).found);

const architectureMessagesOf = async ({ file, code }: ILintFixture): Promise<string[]> => {
  const [result] = await eslint.lintText(code, { filePath: path.join(ROOT, file) });
  const fatal = result.messages.filter((message) => message.fatal);

  if (fatal.length > 0) {
    throw new Error(`fixture does not parse: ${fatal.map((m) => m.message).join('; ')}`);
  }

  return result.messages
    .filter((message) => ARCHITECTURE_RULES.includes(message.ruleId ?? ''))
    .map((message) => `${message.ruleId}: ${message.message}`);
};

const assertResolved = (fixture: ILintFixture): void => {
  const unresolved = unresolvedImportsOf(fixture);

  if (unresolved.length > 0) {
    throw new Error(
      `fixture imports do not resolve, so boundaries cannot see them: ${unresolved.join(', ')}\n` +
        `in ${fixture.file}`,
    );
  }
};

export const lintConfigFor = (file: string): Promise<unknown> =>
  eslint.calculateConfigForFile(path.join(ROOT, file));

expect.extend({
  async toBreakRule(fixture: ILintFixture, ruleId: string) {
    assertResolved(fixture);

    const messages = await architectureMessagesOf(fixture);

    return {
      pass: messages.some((message) => message.startsWith(`${ruleId}: `)),
      message: () =>
        `expected ${fixture.file} ${this.isNot ? 'not ' : ''}to break ${ruleId}\n` +
        `code: ${fixture.code}\nreported: ${JSON.stringify(messages, null, 2)}`,
    };
  },

  async toPassArchitectureLint(fixture: ILintFixture) {
    assertResolved(fixture);

    const messages = await architectureMessagesOf(fixture);

    return {
      pass: messages.length === 0,
      message: () =>
        `expected ${fixture.file} to pass the architecture lint\n` +
        `code: ${fixture.code}\nreported: ${JSON.stringify(messages, null, 2)}`,
    };
  },

  toResolve(source: string) {
    const resolved = resolveImport(source, RESOLVING_FILE, { project: TSCONFIG });

    return {
      pass: resolved.found,
      message: () => `expected ${source} ${this.isNot ? 'not ' : ''}to resolve from a feature`,
    };
  },
});
