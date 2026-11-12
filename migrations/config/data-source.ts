import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import Joi from 'joi';
import { join } from 'path';
import { DataSource } from 'typeorm';

interface IMigrationEnv {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_SSL_CA: string;
}

const directory = join(import.meta.dirname, '../../env/migrations');
const isTest = process.env.NODE_ENV === 'test';
const envFile = isTest ? '.env.test' : '.env';

dotenv.config({ path: join(directory, envFile), override: isTest, quiet: true });

const schema = Joi.object<IMigrationEnv>({
  DATABASE_HOST: Joi.string().hostname().required(),
  DATABASE_PORT: Joi.number().port().min(1).required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SSL_CA: Joi.string().allow('').required(),
}).unknown();
const result = schema.validate(process.env);

if (result.error) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

const env: IMigrationEnv = result.value;

const migrations = join(import.meta.dirname, '../snapshots/*.ts');
const ssl =
  env.DATABASE_SSL_CA === '' ? undefined : { ca: readFileSync(env.DATABASE_SSL_CA, 'utf8') };

export default new DataSource({
  type: 'mysql',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  ssl,
  timezone: 'Z',
  migrations: [migrations],
});
