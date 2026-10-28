import { lintConfigFor } from '../support/lint';

interface IResolvedConfig {
  rules: Record<string, [number | string, ...unknown[]]>;
  settings: Record<string, unknown>;
}

describe('the config itself (eslint.config.mjs, as ESLint resolves it)', () => {
  let config: IResolvedConfig;
  let categories: string[];

  beforeAll(async () => {
    config = (await lintConfigFor(
      'apps/admin-api/src/features/item/application/__fixture__.ts',
    )) as IResolvedConfig;
    categories = (config.settings['boundaries/files'] as { category: string }[]).map(
      (file) => file.category,
    );
  });

  it.each([
    'boundaries/dependencies',
    'boundaries/no-unknown-dependencies',
    'boundaries/no-unknown-files',
    'no-restricted-imports',
    'no-restricted-syntax',
  ])('enforces %s at ERROR', (rule) => {
    const [severity] = config.rules[rule];

    expect(severity).toBe(2);
  });

  it('denies dependencies by default and checks packages and unknown local files too', () => {
    const [, options] = config.rules['boundaries/dependencies'] as [
      number,
      Record<string, unknown>,
    ];

    expect(options.default).toBe('disallow');
    expect(options.checkAllOrigins).toBe(true);
    expect(options.checkUnknownLocals).toBe(true);
  });

  it('checks re-exports and dynamic imports, not only imports', () => {
    expect(config.settings['boundaries/dependency-nodes']).toEqual([
      'import',
      'export',
      'dynamic-import',
    ]);
  });

  it('gives every file exactly one category — the first matching pattern wins', () => {
    expect(config.settings['boundaries/files-single-match']).toBe(true);
  });

  it.each([
    ['acme-app:features:infrastructure:core-adapters', 'acme-app:features:infrastructure'],
    ['acme-app:features:infrastructure:common-adapters', 'acme-app:features:infrastructure'],
    ['acme-app:processors:infrastructure:core-adapters', 'acme-app:processors:infrastructure'],
    ['acme-app:processors:infrastructure:common-adapters', 'acme-app:processors:infrastructure'],
    [
      'acme-app:common:modules:infrastructure:core-adapters',
      'acme-app:common:modules:infrastructure',
    ],
    [
      'acme-app:common:modules:infrastructure:common-adapters',
      'acme-app:common:modules:infrastructure',
    ],
    ['acme-app:app:global:infrastructure:core-adapters', 'acme-app:app:global:infrastructure'],
    ['acme-app:app:global:index', 'acme-app:app'],
    ['acme-app:app:module', 'acme-app:app'],
    ['acme-app:common:modules:module:facade', 'acme-app:common:modules:module'],
    ['acme-core:modules:module:facade', 'acme-core:modules:module'],
    ['acme-libs:contracts', 'acme-libs'],
  ])('keeps %s AHEAD of %s — first match wins', (specific, general) => {
    expect(categories.indexOf(specific)).toBeGreaterThanOrEqual(0);
    expect(categories.indexOf(specific)).toBeLessThan(categories.indexOf(general));
  });

  it('gives core modules the app layers, with facades in module/ instead of presentation/', () => {
    expect(categories).toEqual(
      expect.arrayContaining([
        'acme-app:features:domain',
        'acme-core:modules:domain',
        'acme-app:features:outbound',
        'acme-core:modules:outbound',
        'acme-app:features:application',
        'acme-core:modules:application',
        'acme-app:features:infrastructure',
        'acme-core:modules:infrastructure',
        'acme-app:features:presentation',
        'acme-core:modules:module:facade',
      ]),
    );
    expect(categories).not.toContain('acme-core:modules:presentation');
  });
});
