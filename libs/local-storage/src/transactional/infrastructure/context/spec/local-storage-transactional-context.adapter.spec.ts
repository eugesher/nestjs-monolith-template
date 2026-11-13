import { ClsServiceManager } from 'nestjs-cls';

import { LocalStorageTransactionalContextAdapter } from '../local-storage-transactional-context.adapter';

describe('LocalStorageTransactionalContextAdapter', () => {
  let adapter: LocalStorageTransactionalContextAdapter;

  beforeEach(() => {
    adapter = new LocalStorageTransactionalContextAdapter(ClsServiceManager.getClsService());
  });

  it('answers no hooks outside a context', () => {
    expect(adapter.getHooks()).toBeUndefined();
  });

  it('answers no hooks in a context that has none yet', async () => {
    const hooks = await adapter.run(() => Promise.resolve(adapter.getHooks()));

    expect(hooks).toBeUndefined();
  });

  it('keeps the hooks it was given for the rest of the context', async () => {
    const given: (() => Promise<void>)[] = [];

    const hooks = await adapter.run(() => {
      adapter.setHooks(given);

      return Promise.resolve(adapter.getHooks());
    });

    expect(hooks).toBe(given);
  });

  it('shares the hooks of the outer context with a nested run', async () => {
    const given: (() => Promise<void>)[] = [];

    const hooks = await adapter.run(() => {
      adapter.setHooks(given);

      return adapter.run(() => Promise.resolve(adapter.getHooks()));
    });

    expect(hooks).toBe(given);
  });
});
