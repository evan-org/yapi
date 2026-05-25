# 阶段一：安装依赖、构建前端、裁剪 devDependencies
FROM node:18-bookworm-slim AS builder

WORKDIR /yapi

COPY config.docker.example.json ./config.json
COPY vendors/package.json vendors/package-lock.json ./vendors/
COPY vendors/web/package.json vendors/web/package-lock.json ./vendors/web/

WORKDIR /yapi/vendors
RUN npm ci --legacy-peer-deps
WORKDIR /yapi/vendors/web
RUN npm ci --legacy-peer-deps

WORKDIR /yapi
COPY vendors/ ./vendors/

WORKDIR /yapi/vendors
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV YAPI_API_URL="http://127.0.0.1:3001"
RUN npm run build && npm prune --production
WORKDIR /yapi/vendors/web
RUN npm prune --production

# 阶段二：生产运行
FROM node:18-bookworm-slim

WORKDIR /yapi

COPY --from=builder /yapi/config.json /yapi/config.json
COPY --from=builder /yapi/vendors /yapi/vendors

WORKDIR /yapi/vendors
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
