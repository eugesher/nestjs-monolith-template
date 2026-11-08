import { fromFile, fromLib, libLayerFiles, own, to } from './selectors.mjs';

const ownLib = (file) => to('acme-libs', { ...own('lib'), file });

const fromLayer = (name, layers) =>
  fromFile('acme-libs', libLayerFiles(name), [ownLib(libLayerFiles(...layers))]);

export const libLayers = [
  fromLayer('shell', ['shell', 'application', 'infrastructure']),
  fromLayer('application', ['application', 'outbound']),
  fromLayer('infrastructure', ['infrastructure', 'outbound']),
  fromLayer('outbound', ['outbound']),
  fromFile('acme-libs', '{shell,*/shell}/spec/**', [ownLib(libLayerFiles('outbound'))]),
  fromLib('database', [ownLib('naming/**')], 'orm/shell/**'),
  fromLib('database', [ownLib('repository/**')], 'orm/application/**'),
];
