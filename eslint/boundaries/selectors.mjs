export const own = (...keys) =>
  Object.fromEntries(keys.map((key) => [key, `{{ from.file.captured.${key} }}`]));

export const to = (category, captured) => ({
  to: { file: captured ? { categories: category, captured } : { categories: category } },
});

export const libs = (...names) => to('acme-libs', { lib: names });

export const libContracts = (...names) => to('acme-libs:contracts', { lib: names });

export const packages = (...names) => ({
  to: { module: { origin: ['external', 'core'], source: names } },
});

export const from = (category, allow) => ({ from: { file: { categories: category } }, allow });

export const fromLib = (lib, allow) => ({
  from: { file: { categories: 'acme-libs', captured: { lib } } },
  allow,
});

export const fromSpec = (category) => ({
  from: { file: { categories: category, captured: { file: 'spec/*.spec.ts' } } },
  allow: [to(category, own('app', 'module'))],
});

export const layerOf = (prefix, keys) => (name) => to(`${prefix}:${name}`, own(...keys));

export const appContracts = to('acme-app:contracts', own('app', 'module'));
