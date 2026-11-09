import dotenv from 'dotenv';
import Joi from 'joi';
import { join } from 'path';
import { DataSource } from 'typeorm';

interface IMigrationEnv {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
}

const directory = join(import.meta.dirname, '../../env/migrations');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: join(directory, envFile), quiet: true });

const schema = Joi.object<IMigrationEnv>({
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

const env: IMigrationEnv = result.value;

const migrations = join(import.meta.dirname, '../snapshots/*.ts');

export default new DataSource({
  type: 'mysql',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  timezone: 'Z',
  migrations: [migrations],
});
