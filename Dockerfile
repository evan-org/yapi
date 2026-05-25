# 阶段一：安装依赖、构建前端、裁剪 devDependencies
FROM node:18-bookworm-slim AS builder

WORKDIR /yapi

COPY config.docker.example.json ./config.json
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

RUN npm ci --legacy-peer-deps
WORKDIR /yapi/client
RUN npm ci --legacy-peer-deps

WORKDIR /yapi
COPY . .

WORKDIR /yapi
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV YAPI_API_URL="http://127.0.0.1:3001"
RUN npm run build && npm prune --production
WORKDIR /yapi/client
RUN npm prune --production

# 阶段二：生产运行
FROM node:18-bookworm-slim

WORKDIR /yapi

COPY --from=builder /yapi/config.json /yapi/config.json
COPY --from=builder /yapi /yapi

RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
