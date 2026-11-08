export const own = (...keys) =>
  Object.fromEntries(keys.map((key) => [key, `{{ from.file.captured.${key} }}`]));

export const to = (category, captured) => ({
  to: { file: captured ? { categories: category, captured } : { categories: category } },
});

export const libs = (...names) => to('acme-libs', { lib: names });

export const baseLibs = (...names) => libs('kernel', 'toolkit', ...names);

export const libContracts = (...names) => to('acme-libs:contracts', { lib: names });

export const packages = (...names) => ({
  to: { module: { origin: ['external', 'core'], source: names } },
});

export const from = (category, allow) => ({ from: { file: { categories: category } }, allow });

export const fromLib = (lib, allow, file) => ({
  from: { file: { categories: 'acme-libs', captured: file ? { lib, file } : { lib } } },
  allow,
});

export const fromLibContracts = (lib, allow) => ({
  from: { file: { categories: 'acme-libs:contracts', captured: { lib } } },
  allow,
});

export const fromFile = (category, file, allow) => ({
  from: { file: { categories: category, captured: { file } } },
  allow,
});

export const libLayerFiles = (...names) => {
  const folders = names.flatMap((name) => [name, `*/${name}`]).join(',');

  return `{${folders}}/**`;
};

export const persistenceInterfaces = 'interfaces/{records,queries}/*.ts';

export const fromSpec = (category) => ({
  from: { file: { categories: category, captured: { file: 'spec/*.spec.ts' } } },
  allow: [to(category, own('app', 'module'))],
});

export const layerOf = (prefix, keys) => (name) => to(`${prefix}:${name}`, own(...keys));

export const appContracts = to('acme-app:contracts', own('app', 'module'));
