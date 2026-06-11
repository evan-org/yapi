# 阶段一：安装依赖、构建前端
FROM node:18-bookworm-slim AS builder

WORKDIR /yapi

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV YAPI_API_URL="http://127.0.0.1:7102"
RUN pnpm run build-client

# 阶段二：生产运行
FROM node:18-bookworm-slim

WORKDIR /yapi

COPY --from=builder /yapi /yapi

RUN chmod +x deploy/docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 7101

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:7101/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["./deploy/docker-entrypoint.sh"]
