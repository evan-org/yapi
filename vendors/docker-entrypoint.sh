#!/bin/sh
set -e

MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"

echo "等待 MongoDB ${MONGO_HOST}:${MONGO_PORT} ..."
until node -e "
const net = require('net');
const s = net.createConnection(${MONGO_PORT}, '${MONGO_HOST}', () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 3000);
" 2>/dev/null; do
  sleep 2
done
echo "MongoDB 已就绪"

if [ ! -f /yapi/init.lock ]; then
  echo "提示: 首次部署请执行: docker compose exec yapi node server/install.js"
  echo "      默认管理员密码: ymfe.org"
fi

exec node server/app.js "$@"
