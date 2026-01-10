FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
WORKDIR /app/apps/web

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "dev", "-p", "3000", "-H", "0.0.0.0"]
