import { own, to } from './selectors.mjs';

const layer = (name) => `{${name},*/${name}}`;

const fromLayer = (file, layers, message) => ({
  from: { file: { categories: 'acme-libs', captured: { file } } },
  disallow: layers.map((name) => to('acme-libs', { ...own('lib'), file: `${layer(name)}/**` })),
  message,
});

export const libLayers = [
  fromLayer(
    `${layer('shell')}/*.ts`,
    ['outbound'],
    'the shell of a lib reaches its ports through the application and the infrastructure',
  ),
  fromLayer(
    `${layer('application')}/**`,
    ['shell', 'infrastructure'],
    'the application of a lib sees its outbound ports, not the shell or the adapters',
  ),
  fromLayer(
    `${layer('infrastructure')}/**`,
    ['shell', 'application'],
    'an adapter of a lib implements an outbound port and sees nothing above it',
  ),
  fromLayer(
    `${layer('outbound')}/**`,
    ['shell', 'application', 'infrastructure'],
    'the outbound ports of a lib see only each other',
  ),
];
