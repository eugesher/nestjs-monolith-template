import { ESLint } from 'eslint';
import * as path from 'path';
import * as ts from 'typescript';

interface IPolicyRule {
  to?: { file?: { categories?: unknown; captured?: { lib?: string | string[] } } };
  dependency?: { specifiers?: string[] };
}

interface IPolicy {
  allow?: IPolicyRule[];
  disallow?: IPolicyRule[];
}

describe('policy specifiers', () => {
  it('every lib export a boundaries policy names by specifier exists in that lib', async () => {
    const root = path.resolve(__dirname, '../..');
    const eslint = new ESLint({ cwd: root });
    const config = (await eslint.calculateConfigForFile(
      path.join(root, 'apps/customer-app/src/main.ts'),
    )) as { rules: Record<string, [unknown, { policies: IPolicy[] }]> };
    const [, options] = config.rules['boundaries/dependencies'];
    const named = options.policies
      .flatMap((policy) => [...(policy.allow ?? []), ...(policy.disallow ?? [])])
      .filter((rule) => rule.to?.file?.categories === 'acme-libs')
      .flatMap((rule) =>
        [rule.to?.file?.captured?.lib ?? []]
          .flat()
          .flatMap((lib) =>
            (rule.dependency?.specifiers ?? [])
              .flatMap((specifier) => specifier.replace(/^!?\{?|\}$/g, '').split(','))
              .map((specifier) => ({ lib, specifier })),
          ),
      );
    const tsconfig = ts.readConfigFile(path.join(root, 'tsconfig.json'), (file) =>
      ts.sys.readFile(file),
    );
    const parsed = ts.parseJsonConfigFileContent(tsconfig.config, ts.sys, root);
    const containing = path.join(root, 'apps/customer-app/src/main.ts');
    const entries = [...new Set(named.map(({ lib }) => lib))].map((lib) => {
      const resolved = ts.resolveModuleName(
        `@acme-libs/${lib}`,
        containing,
        parsed.options,
        ts.sys,
      );

      return { lib, file: resolved.resolvedModule?.resolvedFileName ?? '' };
    });
    const program = ts.createProgram(
      entries.map(({ file }) => file),
      parsed.options,
    );
    const checker = program.getTypeChecker();
    const exported = new Map(
      entries.map(({ lib, file }) => {
        const source = program.getSourceFile(file);
        const symbol = source ? checker.getSymbolAtLocation(source) : undefined;
        const names = symbol ? checker.getExportsOfModule(symbol).map((item) => item.name) : [];

        return [lib, names];
      }),
    );
    const missing = named
      .filter(({ lib, specifier }) => !exported.get(lib)?.includes(specifier))
      .map(({ lib, specifier }) => `${specifier} of @acme-libs/${lib}`);

    expect(named.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  }, 60000);
});
