import { ESLint } from 'eslint';
import * as path from 'path';
import * as ts from 'typescript';

interface IPolicyRule {
  to?: {
    file?: { categories?: unknown; captured?: { lib?: string | string[] } };
    module?: { source?: string | string[] };
  };
  dependency?: { specifiers?: string[] };
}

interface IPolicy {
  allow?: IPolicyRule[];
  disallow?: IPolicyRule[];
}

describe('policy specifiers', () => {
  it('every export a boundaries policy names by specifier exists in its lib or package', async () => {
    const root = path.resolve(__dirname, '../..');
    const eslint = new ESLint({ cwd: root });
    const config = (await eslint.calculateConfigForFile(
      path.join(root, 'apps/customer-app/src/main.ts'),
    )) as { rules: Record<string, [unknown, { policies: IPolicy[] }]> };
    const [, options] = config.rules['boundaries/dependencies'];
    const named = options.policies
      .flatMap((policy) => [...(policy.allow ?? []), ...(policy.disallow ?? [])])
      .flatMap((rule) => {
        const libs =
          rule.to?.file?.categories === 'acme-libs'
            ? [rule.to.file.captured?.lib ?? []].flat().map((lib) => `@acme-libs/${lib}`)
            : [];
        const packages = [rule.to?.module?.source ?? []].flat();

        return [...libs, ...packages].flatMap((module) =>
          (rule.dependency?.specifiers ?? [])
            .flatMap((specifier) => specifier.replace(/^!?\{?|\}$/g, '').split(','))
            .map((specifier) => ({ module, specifier })),
        );
      });
    const tsconfig = ts.readConfigFile(path.join(root, 'tsconfig.json'), (file) =>
      ts.sys.readFile(file),
    );
    const parsed = ts.parseJsonConfigFileContent(tsconfig.config, ts.sys, root);
    const containing = path.join(root, 'apps/customer-app/src/main.ts');
    const entries = [...new Set(named.map(({ module }) => module))].map((module) => {
      const resolved = ts.resolveModuleName(module, containing, parsed.options, ts.sys);

      return { module, file: resolved.resolvedModule?.resolvedFileName ?? '' };
    });
    const program = ts.createProgram(
      entries.map(({ file }) => file),
      parsed.options,
    );
    const checker = program.getTypeChecker();
    const exported = new Map(
      entries.map(({ module, file }) => {
        const source = program.getSourceFile(file);
        const symbol = source ? checker.getSymbolAtLocation(source) : undefined;
        const names = symbol ? checker.getExportsOfModule(symbol).map((item) => item.name) : [];

        return [module, names];
      }),
    );
    const missing = named
      .filter(({ module, specifier }) => !exported.get(module)?.includes(specifier))
      .map(({ module, specifier }) => `${specifier} of ${module}`);

    expect(named.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  }, 60000);
});
