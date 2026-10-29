const message = 'put the awaited result into a const before passing it to another call';

export const awaitedArgumentSelectors = [
  {
    selector: ':matches(CallExpression, NewExpression) > AwaitExpression.arguments',
    message,
  },
  {
    selector:
      ':matches(CallExpression, NewExpression) > CallExpression.arguments > MemberExpression.callee > AwaitExpression.object',
    message,
  },
];
