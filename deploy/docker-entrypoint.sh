#!/bin/sh
set -e

PG_HOST="${PG_HOST:-postgres}"
PG_PORT="${PG_PORT:-5432}"

echo "等待 PostgreSQL ${PG_HOST}:${PG_PORT} ..."
until node -e "
const net = require('net');
const s = net.createConnection(${PG_PORT}, '${PG_HOST}', () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 3000);
" 2>/dev/null; do
  sleep 2
done
echo "PostgreSQL 已就绪"

echo "提示: 首次部署请手动导入数据库："
echo "  psql \"\$YAPI_DATABASE_URL\" -f server/db/schema.sql"
echo "  psql \"\$YAPI_DATABASE_URL\" -f server/db/seed.sql"
echo "  默认管理员: admin@admin.com / ymfe.org"

# API（Hono）与 Next.js 前端分别启动
cd /yapi && pnpm run start-server &
cd /yapi && exec pnpm run start-client
