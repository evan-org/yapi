# yapi
因为yapi用的ykit太老了，现在把他升级换成webpack4

后端已迁移至 Fastify。前端构建：`cd vendors && npm run build`（输出到 `static/prd`）。

Docker：`cp config.docker.example.json config.json && docker compose up -d --build`（镜像内自动构建前端）。

开发：`cd vendors && npm run dev-server` 与 `npm run dev-client`（前端 4000 端口代理 API）。
