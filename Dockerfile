FROM node:24.22.1-alpine AS builder

ARG APP_NAME
RUN test -n "$APP_NAME" || (echo "APP_NAME build arg is required" && exit 1)

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY tsconfig.json nest-cli.json rspack.config.js ./
COPY apps/ apps/
COPY core/ core/
COPY libs/ libs/

RUN yarn build:${APP_NAME}

RUN yarn workspaces focus --all --production

FROM node:24.22.1-alpine AS migrations

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn workspaces focus --all --production

COPY migrations/ migrations/
COPY scripts/package.json scripts/
COPY scripts/node/admin-create.ts scripts/node/

USER node

CMD ["node", "./node_modules/typeorm/cli.js", "-d", "./migrations/config/data-source.ts", "migration:run"]

FROM node:24.22.1-alpine

ARG APP_NAME

ENV NODE_ENV=production
ENV APP_NAME=${APP_NAME}

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/nest-cli.json ./nest-cli.json
COPY --from=builder /app/dist/apps/${APP_NAME}/ ./dist/

USER node

CMD ["sh", "-c", "exec node --env-file-if-exists=env/apps/$APP_NAME/.env dist/main.js"]
