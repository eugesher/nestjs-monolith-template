# 032 — Queue lib

The three apps connected Bull with the same module, so the connection lives in a lib:
`libs/queue/src/bull/bull-setup.module.ts`.

| Method                          | Called by                                                                    | What it returns                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `BullSetupModule.forRoot()`     | `AppModule` of each app                                                      | `BullModule.forRootAsync`: the connection to `REDIS_URL`, job options |
| `BullSetupModule.registerQueue` | `common/shared` of each app, the shell of core `product` and `product-stock` | `BullModule.registerQueue({ name })`                                  |

```ts
export const LedgerQueueSetupModule = BullSetupModule.registerQueue(LEDGER_RECORD_QUEUE);
```

**A setup class, not a module.** `BullSetupModule` has no `@Module`: it is a class of static methods
that return the modules of `@nestjs/bull`, and the options are built in the private static
`options(config)`. `LocalStorageSetupModule` of `libs/local-storage` follows the same shape (see
`012-app-bootstrap.md`).

**The lib has no port.** Bull is reached through its decorators: a producer injects the queue with
`@InjectQueue` in its `infrastructure/queue` adapter, and a processor declares `@Processor` in its
presentation (see `008-queue-processor.md`). The lib holds only what every app repeated: the
connection, the job options and the registration of a queue.

## The connection is per app, the job options are not

`forRoot()` takes `REDIS_URL` from `ConfigService`, as `libs/cache` and `libs/credentials` do. The
job options are the private constant `DEFAULT_JOB_OPTIONS` of `BullSetupModule`, listed in
`008-queue-processor.md`. Two apps write to `ledger-record` and to `product-stock-post-subtract`;
options read from the environment of each app would let their jobs retry differently, while the code
of the lib is the same in every app.

**`registerQueue` takes the name alone.** `@nestjs/bull` merges the root options and the queue
options shallowly, so a queue with `defaultJobOptions` of its own would replace the root ones as a
whole. With the name alone, every queue of every app enqueues with the options of `forRoot()`.

## Who sees the lib

| Importer                   | Uses            |
| -------------------------- | --------------- |
| `app.module.ts`            | `forRoot()`     |
| `common/shared` of an app  | `registerQueue` |
| the shell of a core module | `registerQueue` |

No other layer imports `libs/queue`, and none of the three above imports `@nestjs/bull`: the package
is left to the lib, to the queue adapters of `infrastructure/queue` and to the presentation of the
processors. The lib itself sees `@nestjs/bull`, `@nestjs/common` and `@nestjs/config` (see
`016-lint-allowlists.md`).
