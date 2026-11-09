import dotenv from 'dotenv';
import { readdirSync, readFileSync } from 'fs';
import Joi from 'joi';
import { basename, join } from 'path';
import { DataSource } from 'typeorm';
import type { QueryRunner } from 'typeorm';

interface ISeedEnv {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
}

interface ISeedFile {
  table: string;
  query: string;
}

interface IForeignKeyColumn {
  name: string;
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

interface IForeignKey {
  name: string;
  table: string;
  referencedTable: string;
  columns: string[];
  referencedColumns: string[];
}

const readEnv = (): ISeedEnv => {
  dotenv.config({
    path: join(import.meta.dirname, '../../../env/migrations/.env.test'),
    override: true,
    quiet: true,
  });

  const schema = Joi.object<ISeedEnv>({
    DATABASE_HOST: Joi.string().hostname().required(),
    DATABASE_PORT: Joi.number().port().min(1).required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
  }).unknown();
  const result = schema.validate(process.env);

  if (result.error) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }

  return result.value;
};

const readSeedFiles = (): ISeedFile[] => {
  const directory = join(import.meta.dirname, 'data');
  const files = readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return files.map((file) => {
    const table = basename(file, '.sql');
    const text = readFileSync(join(directory, file), 'utf8');
    const query = text.trim().replace(/;$/, '');

    return { table, query };
  });
};

const groupForeignKeys = (rows: IForeignKeyColumn[]): IForeignKey[] => {
  const keys = new Map<string, IForeignKey>();

  for (const row of rows) {
    const id = `${row.table}.${row.name}`;
    const key = keys.get(id) ?? {
      name: row.name,
      table: row.table,
      referencedTable: row.referencedTable,
      columns: [],
      referencedColumns: [],
    };

    key.columns.push(row.column);
    key.referencedColumns.push(row.referencedColumn);
    keys.set(id, key);
  }

  return [...keys.values()];
};

const countOrphans = async (runner: QueryRunner, key: IForeignKey): Promise<number> => {
  const join = key.columns
    .map((column, index) => `c.\`${column}\` = p.\`${key.referencedColumns[index]}\``)
    .join(' AND ');
  const referencing = key.columns.map((column) => `c.\`${column}\` IS NOT NULL`).join(' AND ');
  const result: unknown = await runner.query(
    `SELECT COUNT(*) AS count FROM \`${key.table}\` c
     LEFT JOIN \`${key.referencedTable}\` p ON ${join}
     WHERE ${referencing} AND p.\`${key.referencedColumns[0]}\` IS NULL`,
  );
  const rows = result as { count: string }[];

  return Number(rows[0].count);
};

const findOrphans = async (runner: QueryRunner, tables: string[]): Promise<string[]> => {
  const result: unknown = await runner.query(
    `SELECT CONSTRAINT_NAME AS name, TABLE_NAME AS \`table\`, COLUMN_NAME AS \`column\`,
       REFERENCED_TABLE_NAME AS referencedTable, REFERENCED_COLUMN_NAME AS referencedColumn
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_NAME IN (?)
     ORDER BY TABLE_NAME, CONSTRAINT_NAME, ORDINAL_POSITION`,
    [tables],
  );
  const rows = result as IForeignKeyColumn[];
  const keys = groupForeignKeys(rows);
  const orphans: string[] = [];

  for (const key of keys) {
    const count = await countOrphans(runner, key);

    if (count > 0) {
      const columns = key.columns.join(', ');

      orphans.push(
        `${key.name}: ${count} ${key.table} row(s) with (${columns}) missing in ${key.referencedTable}`,
      );
    }
  }

  return orphans;
};

const seed = async (runner: QueryRunner, files: ISeedFile[]): Promise<void> => {
  await runner.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const file of files) {
    await runner.query(file.query);

    process.stdout.write(`Seeded ${file.table}\n`);
  }

  await runner.query('SET FOREIGN_KEY_CHECKS = 1');

  const tables = files.map((file) => file.table);
  const orphans = await findOrphans(runner, tables);

  if (orphans.length > 0) {
    throw new Error(`Seeded rows break foreign keys:\n${orphans.join('\n')}`);
  }
};

const env = readEnv();
const files = readSeedFiles();
const dataSource = new DataSource({
  type: 'mysql',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  timezone: 'Z',
});

await dataSource.initialize();

const runner = dataSource.createQueryRunner();

try {
  await seed(runner, files);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  process.stderr.write(`Seed failed: ${message}\n`);
  process.exitCode = 1;
} finally {
  await runner.release();
  await dataSource.destroy();
}
