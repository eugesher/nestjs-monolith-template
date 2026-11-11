import ts from 'typescript';

const TOKEN_DECORATORS = new Set([
  'InjectDataSource',
  'InjectPinoLogger',
  'InjectQueue',
  'InjectRepository',
]);

const decoratorName = (decorator) => {
  const { expression } = decorator;
  const callee = expression.type === 'CallExpression' ? expression.callee : expression;

  return callee.type === 'Identifier' ? callee.name : null;
};

const injectsByToken = (parameter) =>
  (parameter.decorators ?? []).some((decorator) => {
    const name = decoratorName(decorator);
    const { expression } = decorator;

    if (name === 'Inject') {
      return expression.type === 'CallExpression' && expression.arguments.length > 0;
    }

    return TOKEN_DECORATORS.has(name);
  });

const isDecorated = (node) => (node?.decorators ?? []).length > 0;

const enclosingClass = (node) => {
  let current = node.parent;

  while (current && current.type !== 'ClassDeclaration' && current.type !== 'ClassExpression') {
    current = current.parent;
  }

  return current;
};

const readsMetadataOfParameter = (parameter, method) => {
  if (method.kind === 'constructor') {
    return isDecorated(enclosingClass(method)) && !injectsByToken(parameter);
  }

  return isDecorated(method) || method.value.params.some(isDecorated);
};

const metadataReadsType = (identifier) => {
  let node = identifier.parent;

  while (node && node.type !== 'TSTypeAnnotation') {
    node = node.parent;
  }

  if (!node) {
    return false;
  }

  const owner = node.parent;

  if (owner.type === 'PropertyDefinition') {
    return isDecorated(owner);
  }

  if (owner.type === 'FunctionExpression' && owner.parent?.type === 'MethodDefinition') {
    return owner.returnType === node && isDecorated(owner.parent);
  }

  const parameter = owner.parent?.type === 'TSParameterProperty' ? owner.parent : owner;
  const fn = parameter.parent;

  if (fn?.type === 'FunctionExpression' && fn.parent?.type === 'MethodDefinition') {
    return readsMetadataOfParameter(parameter, fn.parent);
  }

  return false;
};

export const typeImportsInDecoratedFiles = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [],
    messages: {
      missingType: '{{ name }} has no runtime value, so its import takes `type`',
      typeOnlyClass:
        '{{ name }} is used only as a type that no decorator metadata reads, so its import takes `type`',
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

    const isTypeOnlyClass = (specifier) => {
      const [variable] = context.sourceCode.getDeclaredVariables(specifier);
      const references = variable?.references ?? [];

      return (
        references.length > 0 &&
        references.every((reference) => reference.isTypeReference && !reference.isValueReference) &&
        !references.some((reference) => metadataReadsType(reference.identifier))
      );
    };

    const report = (specifier, messageId) => {
      context.report({
        node: specifier,
        messageId,
        data: { name: specifier.local.name },
        fix: (fixer) => fixer.insertTextBefore(specifier, 'type '),
      });
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

        specifiers.forEach((specifier) => {
          if (hasNoValue(specifier)) {
            report(specifier, 'missingType');
          } else if (isTypeOnlyClass(specifier)) {
            report(specifier, 'typeOnlyClass');
          }
        });
      },
    };
  },
};
