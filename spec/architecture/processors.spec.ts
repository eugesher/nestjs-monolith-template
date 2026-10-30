import '../support/lint';
import { Scaffold } from '../support/scaffold';

describe('processors (processors/<module>) — modules entered by queues and schedules', () => {
  let scaffold: Scaffold;

  beforeAll(() => {
    scaffold = Scaffold.create([
      'apps/__processors-fixture__/src/processors/index.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/ledger-record.module.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/domain/index.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/outbound/index.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/application/index.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/application/services/ledger-record.service.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/infrastructure/index.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/presentation/index.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/presentation/ledger-record.consumer.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/presentation/handlers/ledger-record.handler.ts',
      'apps/__processors-fixture__/src/processors/purge/purge.module.ts',
      'apps/__processors-fixture__/src/processors/purge/application/index.ts',
      'apps/__processors-fixture__/src/processors/digest/digest.module.ts',
      'apps/__processors-fixture__/src/processors/digest/modules/index.ts',
      'apps/__processors-fixture__/src/processors/digest/modules/digest-daily/digest-daily.module.ts',
      'apps/__processors-fixture__/src/processors/digest/modules/digest-daily/presentation/index.ts',
      'apps/__processors-fixture__/src/features/product/product.module.ts',
      'apps/__processors-fixture__/src/features/product/application/index.ts',
      'apps/__processors-fixture__/src/contracts/ledger-record/index.ts',
      'apps/__processors-fixture__/src/common/shared/ledger-record/index.ts',
      'apps/__processors-fixture__/src/contracts/idempotency/index.ts',
      'apps/__processors-fixture__/src/common/modules/idempotency/index.ts',
      'core/modules/src/__ledger-fixture__/index.ts',
      'core/contracts/src/__ledger-fixture__/index.ts',
      'core/entities/src/index.ts',
      'libs/http/src/index.ts',
      'libs/observability/src/index.ts',
    ]);
  });

  afterAll(() => {
    scaffold.remove();
  });

  describe('mounting', () => {
    it('bootstrap MAY mount processors through the processors index', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../processors";',
      }).toPassArchitectureLint();
    });

    it('bootstrap may NOT reach a processor past the index', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../processors/ledger-record/ledger-record.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the index MAY re-export a processor root', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/index.ts',
        code: 'export * from "./ledger-record/ledger-record.module";',
      }).toPassArchitectureLint();
    });

    it('the index may NOT re-export a layer', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/index.ts',
        code: 'export * from "./ledger-record/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a file next to the index is unknown', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/__fixture__.ts',
        code: 'export const orphan = 1;',
      }).toBreakRule('boundaries/no-unknown-files');
    });
  });

  describe('the processor root', () => {
    it('MAY reach its layers, core and common modules', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code:
          'import { x } from "./application";\n' +
          'import { y } from "./presentation";\n' +
          'import { z } from "../../../../../core/modules/src/__ledger-fixture__";\n' +
          'import { w } from "../../common/modules/idempotency";',
      }).toPassArchitectureLint();
    });

    it('may NOT import entities — it wires them through infrastructure', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code: 'import { x } from "../../../../../core/entities/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('may NOT skip the barrel of another layer', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code: 'import { x } from "./application/services/ledger-record.service";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('MAY reach its consumer directly', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code: 'import { x } from "./presentation/ledger-record.consumer";',
      }).toPassArchitectureLint();
    });

    it('may NOT reach a nested presentation file that is not a consumer', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code: 'import { x } from "./presentation/handlers/ledger-record.handler";',
      }).toBreakRule('no-restricted-syntax');
    });

    it('may NOT declare HTTP controllers', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code: 'import { Controller } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('layers', () => {
    it.each(['domain', 'outbound'])('%s is framework-free', async (layer) => {
      await expect({
        file: `apps/__processors-fixture__/src/processors/ledger-record/${layer}/__fixture__.ts`,
        code: 'import { Injectable } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('application MAY reach its own domain and outbound', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/application/services/__fixture__.ts',
        code: 'import { x } from "../../domain";\nimport { y } from "../../outbound";',
      }).toPassArchitectureLint();
    });

    it('application may NOT reach infrastructure', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/application/services/__fixture__.ts',
        code: 'import { x } from "../../infrastructure";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('infrastructure/core-adapters MAY reach core contracts', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/infrastructure/core-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../../../../core/contracts/src/__ledger-fixture__";',
      }).toPassArchitectureLint();
    });

    it('infrastructure/common-adapters MAY reach app contracts', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/ledger-record";',
      }).toPassArchitectureLint();
    });

    it('infrastructure/common-adapters MAY reach the contract of a common module', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/purge/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { x } from "../../../../contracts/idempotency";',
      }).toPassArchitectureLint();
    });

    it('infrastructure/common-adapters MAY take the DI names from @nestjs/common', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { Inject, Injectable } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it('infrastructure/common-adapters take only the DI names from @nestjs/common', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/infrastructure/common-adapters/__fixture__.ts',
        code: 'import { Injectable, Controller } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it.each([
      ['infrastructure/persistence', '../../../../../../../core/contracts/src/__ledger-fixture__'],
      ['infrastructure/persistence', '../../../../contracts/ledger-record'],
      ['application/services', '../../../../../../../core/contracts/src/__ledger-fixture__'],
    ])('%s may NOT reach %s — only the matching adapters do', async (folder, source) => {
      await expect({
        file: `apps/__processors-fixture__/src/processors/ledger-record/${folder}/__fixture__.ts`,
        code: `import { x } from "${source}";`,
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('consumers (presentation)', () => {
    it('a consumer MAY reach its application, app contracts and the observability lib', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code:
          'import { x } from "../application";\n' +
          'import { y } from "../../../contracts/ledger-record";\n' +
          'import { z } from "../../../../../../libs/observability/src";',
      }).toPassArchitectureLint();
    });

    it('a consumer may NOT reach a core contract other than the ledger queue — core is called by the application through a port', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { x } from "../../../../../../core/contracts/src/__ledger-fixture__";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a consumer may NOT import crypto — the correlation id comes from the observability lib', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { randomUUID } from "crypto";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a consumer may NOT reach the http lib', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { x } from "../../../../../../libs/http/src";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a consumer MAY take the DI names from @nestjs/common', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { Injectable } from "@nestjs/common";',
      }).toPassArchitectureLint();
    });

    it('a consumer may NOT be an HTTP controller', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { Controller, Post } from "@nestjs/common";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a consumer MAY process a queue with Processor, Process, OnQueueFailed and the Job type', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { OnQueueFailed, Process, Processor } from "@nestjs/bull";\nimport type { Job } from "bull";',
      }).toPassArchitectureLint();
    });

    it.each([
      'import { InjectQueue } from "@nestjs/bull";',
      'import { BullModule, Processor } from "@nestjs/bull";',
      'import type { Queue } from "bull";',
    ])(
      'a consumer may NOT take the queue itself (%s) — queues are registered in common/shared',
      async (code) => {
        await expect({
          file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
          code,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it.each([
      'apps/__processors-fixture__/src/processors/ledger-record/application/__fixture__.ts',
      'apps/__processors-fixture__/src/processors/ledger-record/infrastructure/__fixture__.ts',
      'apps/__processors-fixture__/src/features/product/presentation/__fixture__.ts',
      'apps/__processors-fixture__/src/features/product/infrastructure/__fixture__.ts',
      'apps/__processors-fixture__/src/app/__fixture__.ts',
    ])('%s may NOT process a queue — only processor consumers do', async (file) => {
      await expect({
        file,
        code: 'import { Processor } from "@nestjs/bull";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('common/shared MAY register a queue with BullModule', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/common/shared/ledger-record/queues/__fixture__.ts',
        code: 'import { BullModule } from "@nestjs/bull";\nimport { x } from "../../../../contracts/ledger-record";',
      }).toPassArchitectureLint();
    });

    it('common/shared may NOT inject a queue — producers inject it in infrastructure/queue', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/common/shared/ledger-record/queues/__fixture__.ts',
        code: 'import { InjectQueue } from "@nestjs/bull";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the app MAY connect Bull to Redis', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/app/setup/queue/__fixture__.ts',
        code: 'import { BullModule, BullRootModuleOptions } from "@nestjs/bull";',
      }).toPassArchitectureLint();
    });

    it('the app may NOT register a queue of its own — queues are registered in common/shared', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/app/setup/queue/__fixture__.ts',
        code: 'import { BullModule, InjectQueue } from "@nestjs/bull";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a consumer MAY schedule with Cron and CronExpression', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/purge/presentation/__fixture__.ts',
        code: 'import { Cron, CronExpression } from "@nestjs/schedule";',
      }).toPassArchitectureLint();
    });

    it.each([
      'import { SchedulerRegistry } from "@nestjs/schedule";',
      'import { Cron, ScheduleModule } from "@nestjs/schedule";',
    ])(
      'a consumer may NOT take the scheduler itself (%s) — the app sets up ScheduleModule',
      async (code) => {
        await expect({
          file: 'apps/__processors-fixture__/src/processors/purge/presentation/__fixture__.ts',
          code,
        }).toBreakRule('boundaries/dependencies');
      },
    );

    it.each([
      'apps/__processors-fixture__/src/processors/purge/application/__fixture__.ts',
      'apps/__processors-fixture__/src/processors/purge/infrastructure/__fixture__.ts',
      'apps/__processors-fixture__/src/processors/purge/__fixture__.ts',
      'apps/__processors-fixture__/src/features/product/presentation/__fixture__.ts',
      'apps/__processors-fixture__/src/common/modules/idempotency/application/__fixture__.ts',
    ])('%s may NOT schedule — only processor consumers do', async (file) => {
      await expect({
        file,
        code: 'import { Cron } from "@nestjs/schedule";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('the app MAY set up ScheduleModule', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/app/setup/schedule/__fixture__.ts',
        code: 'import { ScheduleModule } from "@nestjs/schedule";',
      }).toPassArchitectureLint();
    });

    it('the app may NOT schedule a job itself — schedules belong to processor consumers', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/app/setup/schedule/__fixture__.ts',
        code: 'import { Cron } from "@nestjs/schedule";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a consumer may NOT import the HTTP platform', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/presentation/__fixture__.ts',
        code: 'import { x } from "@nestjs/platform-express";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('nested processors (<module>/modules/<submodule>)', () => {
    it('the aggregator root MAY mount its submodules through modules/index.ts', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/digest/__fixture__.ts',
        code: 'import { x } from "./modules";',
      }).toPassArchitectureLint();
    });

    it('the submodules index MAY re-export its own submodule roots', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/digest/modules/index.ts',
        code: 'export * from "./digest-daily/digest-daily.module";',
      }).toPassArchitectureLint();
    });

    it('the submodules index may NOT re-export a submodule layer', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/digest/modules/index.ts',
        code: 'export * from "./digest-daily/presentation";',
      }).toBreakRule('boundaries/dependencies');
    });
  });

  describe('isolation', () => {
    it('a processor may NOT reach another processor', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/application/__fixture__.ts',
        code: 'import { x } from "../../purge/application";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a processor may NOT reach a feature', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/processors/ledger-record/__fixture__.ts',
        code: 'import { x } from "../../features/product/product.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('a feature may NOT reach a processor', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/features/product/__fixture__.ts',
        code: 'import { x } from "../../processors/ledger-record/ledger-record.module";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('common may NOT reach processors', async () => {
      await expect({
        file: 'apps/__processors-fixture__/src/common/shared/auth/__fixture__.ts',
        code: 'import { x } from "../../../processors";',
      }).toBreakRule('boundaries/dependencies');
    });

    it('another app may NOT mount these processors', async () => {
      await expect({
        file: 'apps/__processors-other-fixture__/src/app/__fixture__.ts',
        code: 'import { x } from "../../../__processors-fixture__/src/processors";',
      }).toBreakRule('boundaries/dependencies');
    });
  });
});
