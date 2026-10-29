import dotenv from 'dotenv';
import Joi from 'joi';
import { join } from 'path';
import { DataSource } from 'typeorm';

interface IMigrationEnv {
  DATABASE_URL: string;
}

const directory = join(import.meta.dirname, '..');
const envFiles = [join(directory, '.env.local'), join(directory, '.env')];

dotenv.config({ path: envFiles, quiet: true });

const schema = Joi.object<IMigrationEnv>({
  DATABASE_URL: Joi.string().uri({ scheme: 'mysql' }).required(),
}).unknown();
const result = schema.validate(process.env);

if (result.error) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

const env: IMigrationEnv = result.value;

const migrations = join(import.meta.dirname, '../snapshots/*.ts');

export default new DataSource({
  type: 'mysql',
  url: env.DATABASE_URL,
  timezone: 'Z',
  migrations: [migrations],
});
