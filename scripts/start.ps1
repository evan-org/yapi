<#
.SYNOPSIS
    一键启动 YApi 前后端服务

.DESCRIPTION
    开发模式（默认）: .\scripts\start.ps1
    生产模式:         .\scripts\start.ps1 -Prod
#>
param(
    [switch]$Prod
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

# 确保 server/.env 存在
$envFile = Join-Path $Root "server\.env"
$envExample = Join-Path $Root "server\.env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "[start] 已从 server\.env.example 生成 server\.env，请按需修改后重启" -ForegroundColor Yellow
    } else {
        Write-Host "[start] 未找到 server\.env.example，无法自动生成配置" -ForegroundColor Red
        exit 1
    }
}

$mode = if ($Prod) { "start" } else { "dev" }
$label = if ($Prod) { "生产" } else { "开发" }

Write-Host "[start] 以${label}模式启动 YApi..." -ForegroundColor Cyan

# Windows 上 npm 是 npm.cmd
$npmCmd = if (Get-Command npm.cmd -ErrorAction SilentlyContinue) { "npm.cmd" } else { "npm" }

# 启动后端
$server = Start-Process -FilePath $npmCmd -ArgumentList "run", $mode, "--workspace=yapi-server" -PassThru -NoNewWindow
# 启动前端
$client = Start-Process -FilePath $npmCmd -ArgumentList "run", $mode, "--workspace=client" -PassThru -NoNewWindow

Write-Host "[start] server PID=$($server.Id), client PID=$($client.Id)" -ForegroundColor Green
Write-Host "[start] 按 Ctrl+C 停止所有服务" -ForegroundColor Green

# Ctrl+C 优雅退出
function Shutdown {
    Write-Host "`n[start] 正在关闭服务..." -ForegroundColor Yellow
    Stop-Process -Id $server.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $client.Id -ErrorAction SilentlyContinue
    exit 0
}

$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Shutdown }

try {
    Wait-Process -Id $server.Id, $client.Id -ErrorAction SilentlyContinue
} catch {
    # 被 Ctrl+C 中断
} finally {
    Shutdown
}
