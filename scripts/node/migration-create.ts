import { writeFileSync } from 'fs';
import { join } from 'path';

const [name] = process.argv.slice(2);

if (name === undefined || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  process.stderr.write('Usage: yarn migration:create <PascalCaseName>\n');
  process.exit(1);
}

const timestamp = Date.now();
const file = join(import.meta.dirname, '../../migrations/snapshots', `${timestamp}-${name}.ts`);
const template = `import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ${name}${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`\`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`\`);
  }
}
`;

writeFileSync(file, template, { flag: 'wx' });

process.stdout.write(`Created ${file}\n`);
