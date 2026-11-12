import { ESLint } from 'eslint';
import * as path from 'path';

import { Scaffold } from '../support/scaffold';

describe('type imports', () => {
  const file = path.resolve(__dirname, '../../libs/ledger/src/__type-imports-fixture__.ts');
  const rulesOf = async (code: string): Promise<(string | null)[]> => {
    const [result] = await eslint.lintText(code, { filePath: file });

    return result.messages.map((message) => message.ruleId);
  };

  let scaffold: Scaffold;
  let eslint: ESLint;

  beforeAll(() => {
    scaffold = Scaffold.create(['libs/ledger/src/__type-imports-fixture__.ts']);
    eslint = new ESLint({ cwd: path.resolve(__dirname, '../..') });
  });

  afterAll(() => {
    scaffold.remove();
  });

  it('a decorated file may NOT import an interface without type', async () => {
    const rules = await rulesOf(
      'import { Injectable } from "@nestjs/common";\nimport { ILedgerLibPort } from "@acme-libs/contracts/ledger";\n@Injectable()\nexport class Item {\n  public read(port: ILedgerLibPort): ILedgerLibPort {\n    return port;\n  }\n}\n',
    );

    expect(rules).toContain('acme/type-imports-in-decorated-files');
  }, 120000);

  it('a decorated file MAY import an interface with type', async () => {
    const rules = await rulesOf(
      'import { Injectable } from "@nestjs/common";\nimport type { ILedgerLibPort } from "@acme-libs/contracts/ledger";\n@Injectable()\nexport class Item {\n  public read(port: ILedgerLibPort): ILedgerLibPort {\n    return port;\n  }\n}\n',
    );

    expect(rules).not.toContain('acme/type-imports-in-decorated-files');
  }, 120000);

  it('a decorated file keeps a class of a constructor as a value import', async () => {
    const rules = await rulesOf(
      'import { Injectable } from "@nestjs/common";\nimport { ConfigService } from "@nestjs/config";\n@Injectable()\nexport class Item {\n  constructor(public readonly config: ConfigService) {}\n}\n',
    );

    expect(rules).not.toContain('acme/type-imports-in-decorated-files');
    expect(rules).not.toContain('@typescript-eslint/consistent-type-imports');
  }, 120000);

  it('a decorated file may NOT import a class that only a parameter injected by a token uses', async () => {
    const rules = await rulesOf(
      'import { Inject, Injectable } from "@nestjs/common";\nimport { ConfigService } from "@nestjs/config";\n@Injectable()\nexport class Item {\n  constructor(@Inject("CONFIG") public readonly config: ConfigService) {}\n}\n',
    );

    expect(rules).toContain('acme/type-imports-in-decorated-files');
  }, 120000);

  it('a decorated file keeps a class of a parameter injected by @Inject() without a token', async () => {
    const rules = await rulesOf(
      'import { Inject, Injectable } from "@nestjs/common";\nimport { ConfigService } from "@nestjs/config";\n@Injectable()\nexport class Item {\n  constructor(@Inject() public readonly config: ConfigService) {}\n}\n',
    );

    expect(rules).not.toContain('acme/type-imports-in-decorated-files');
  }, 120000);

  it('a decorated file keeps a class that the metadata of a decorated property reads', async () => {
    const rules = await rulesOf(
      'import { Inject } from "@nestjs/common";\nimport { ConfigService } from "@nestjs/config";\nexport class Item {\n  @Inject("CONFIG")\n  public readonly config!: ConfigService;\n}\n',
    );

    expect(rules).not.toContain('acme/type-imports-in-decorated-files');
  }, 120000);

  it('a file without decorators may NOT import a type without type', async () => {
    const rules = await rulesOf(
      'import { ILedgerLibPort } from "@acme-libs/contracts/ledger";\nexport const read = (port: ILedgerLibPort): ILedgerLibPort => port;\n',
    );

    expect(rules).toContain('@typescript-eslint/consistent-type-imports');
    expect(rules).not.toContain('acme/type-imports-in-decorated-files');
  }, 120000);

  it('an import of types only may NOT keep type inside the braces', async () => {
    const rules = await rulesOf(
      'import { type ILedgerLibPort } from "@acme-libs/contracts/ledger";\nexport const read = (port: ILedgerLibPort): ILedgerLibPort => port;\n',
    );

    expect(rules).toContain('@typescript-eslint/no-import-type-side-effects');
  }, 120000);
});
