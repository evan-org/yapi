# YApi 后端（Fastify）+ 静态资源
FROM node:18-bookworm-slim

WORKDIR /yapi/vendors

# 安装依赖（利用层缓存）
COPY vendors/package.json vendors/package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# 业务代码
COPY vendors/ ./

# 运行时配置挂载到 /yapi/config.json
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server/app.js"]
