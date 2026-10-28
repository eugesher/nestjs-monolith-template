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

FROM node:24.22.1-alpine

ARG APP_NAME

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/${APP_NAME}/ ./dist/

USER node

CMD ["node", "dist/main.js"]
