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

if [ ! -f /yapi/server/init.lock ]; then
  echo "提示: 首次部署请执行: docker compose -f deploy/docker-compose.yml exec yapi npm run install-server -w yapi-server"
  echo "      默认管理员密码: ymfe.org"
fi

# API 在 server/ 工作区内启动；Next 在 client/
cd /yapi/server && node app.js "$@" &
cd /yapi && exec npm run start:client --workspace=client -- -p 4000 -H 0.0.0.0
