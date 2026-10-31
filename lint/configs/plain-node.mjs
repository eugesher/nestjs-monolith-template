import { builtinModules } from 'module';

const nodeModules = builtinModules.map((name) => name.replace('/', '\\/')).join('|');
const message = 'runs under plain node as an ES module';

export const plainNode = {
  files: ['migrations/**/*.ts', 'scripts/**/*.ts', 'test/**/*.ts'],
  rules: {
    'no-restricted-globals': [
      'error',
      { name: '__dirname', message: `${message}: use import.meta.dirname` },
      { name: '__filename', message: `${message}: use import.meta.filename` },
      { name: 'require', message: `${message}: use import` },
      { name: 'module', message: `${message}: use export` },
      { name: 'exports', message: `${message}: use export` },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration:not([source.value=/^(node:)?(${nodeModules})$/]) > ImportNamespaceSpecifier`,
        message: `${message}: import a CommonJS package by its default export, a namespace import has no callable members`,
      },
    ],
  },
};
