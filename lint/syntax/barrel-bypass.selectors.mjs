const barrelBypass =
  '/^\\.\\.?\\x2F(.*\\x2F)?(domain|outbound|application|infrastructure|presentation)\\x2F(?![\\w-]+\\.consumer$)./';

const message = "cross-layer imports go through the target layer's barrel (index.ts)";

export const barrelBypassSelectors = [
  'ImportDeclaration',
  'ExportAllDeclaration',
  'ExportNamedDeclaration',
  'ImportExpression',
].map((node) => ({
  selector: `${node}[source.value=${barrelBypass}]`,
  message,
}));
