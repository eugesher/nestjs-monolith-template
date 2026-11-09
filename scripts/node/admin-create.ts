import argon2 from 'argon2';
import dotenv from 'dotenv';
import Joi from 'joi';
import { join } from 'path';
import { DataSource } from 'typeorm';
import type { QueryRunner } from 'typeorm';

interface IAdminEnv {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

interface IInsertResult {
  insertId: number;
}

const ROLE_NAME = 'admin';
const PERMISSION_CODE = 'access-management';

const readEnv = (): IAdminEnv => {
  dotenv.config({
    path: join(import.meta.dirname, '../../env/migrations/.env'),
    quiet: true,
  });

  const schema = Joi.object<IAdminEnv>({
    DATABASE_HOST: Joi.string().hostname().required(),
    DATABASE_PORT: Joi.number().port().min(1).required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    ADMIN_EMAIL: Joi.string().trim().lowercase().email({ tlds: false }).max(255).required(),
    ADMIN_PASSWORD: Joi.string().min(12).required(),
  }).unknown();
  const result = schema.validate(process.env);

  if (result.error) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }

  return result.value;
};

const createAdmin = async (
  runner: QueryRunner,
  email: string,
  passwordHash: string,
): Promise<void> => {
  const user = (await runner.query('INSERT INTO staff_user (email, password_hash) VALUES (?, ?)', [
    email,
    passwordHash,
  ])) as IInsertResult;
  const role = (await runner.query(
    'INSERT INTO staff_role (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
    [ROLE_NAME],
  )) as IInsertResult;

  await runner.query('INSERT IGNORE INTO staff_role_permissions (role_id, code) VALUES (?, ?)', [
    role.insertId,
    PERMISSION_CODE,
  ]);
  await runner.query('INSERT INTO staff_user_roles (user_id, role_id) VALUES (?, ?)', [
    user.insertId,
    role.insertId,
  ]);
};

const run = async (env: IAdminEnv): Promise<void> => {
  const passwordHash = await argon2.hash(env.ADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
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
    await runner.startTransaction();
    await createAdmin(runner, env.ADMIN_EMAIL, passwordHash);
    await runner.commitTransaction();
  } catch (error) {
    await runner.rollbackTransaction();

    throw error;
  } finally {
    await runner.release();
    await dataSource.destroy();
  }
};

try {
  const env = readEnv();

  await run(env);

  process.stdout.write(`Created admin ${env.ADMIN_EMAIL}\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  process.stderr.write(`Admin creation failed: ${message}\n`);
  process.exitCode = 1;
}
