#!/usr/bin/env bash
#
# 一键启动 YApi 前后端服务
#
# 用法：./scripts/start.sh          开发模式（默认）
#       ./scripts/start.sh --prod   生产模式
#

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 解析参数
MODE="dev"
for arg in "$@"; do
  case "$arg" in
    --prod) MODE="start" ;;
  esac
done

# 确保 server/.env 存在
if [ ! -f "$ROOT/server/.env" ]; then
  if [ -f "$ROOT/server/.env.example" ]; then
    cp "$ROOT/server/.env.example" "$ROOT/server/.env"
    echo "[start] 已从 server/.env.example 生成 server/.env，请按需修改后重启"
  else
    echo "[start] 未找到 server/.env.example，无法自动生成配置" >&2
    exit 1
  fi
fi

LABEL="开发"
if [ "$MODE" = "start" ]; then
  LABEL="生产"
fi

echo "[start] 以${LABEL}模式启动 YApi..."

# 退出时杀掉所有子进程
trap 'echo -e "\n[start] 正在关闭服务..."; kill 0 2>/dev/null; exit 0' SIGINT SIGTERM

# 启动后端
pnpm --filter yapi-server "$MODE" &
SERVER_PID=$!

# 启动前端
pnpm --filter yapi-client "$MODE" -- -p 4000 &
CLIENT_PID=$!

echo "[start] server PID=$SERVER_PID, client PID=$CLIENT_PID"
echo "[start] 按 Ctrl+C 停止所有服务"

# 等待任意子进程退出
wait -n "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true

echo "[start] 有进程已退出，关闭所有服务..."
kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true
wait 2>/dev/null
