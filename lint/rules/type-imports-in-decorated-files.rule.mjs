import ts from 'typescript';

export const typeImportsInDecoratedFiles = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [],
    messages: {
      missingType: '{{ name }} has no runtime value, so its import takes `type`',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices;

    if (!services?.program) {
      return {};
    }

    const checker = services.program.getTypeChecker();
    const specifiers = [];
    let decorated = false;

    const hasNoValue = (specifier) => {
      const node = services.esTreeNodeToTSNodeMap.get(specifier.local);
      const symbol = checker.getSymbolAtLocation(node);
      const target = symbol && checker.getAliasedSymbol(symbol);

      return target !== undefined && (target.flags & ts.SymbolFlags.Value) === 0;
    };

    return {
      Decorator() {
        decorated = true;
      },
      'ImportDeclaration[importKind="value"] > ImportSpecifier[importKind="value"]'(specifier) {
        specifiers.push(specifier);
      },
      'Program:exit'() {
        if (!decorated) {
          return;
        }

        specifiers.filter(hasNoValue).forEach((specifier) => {
          context.report({
            node: specifier,
            messageId: 'missingType',
            data: { name: specifier.local.name },
            fix: (fixer) => fixer.insertTextBefore(specifier, 'type '),
          });
        });
      },
    };
  },
};
