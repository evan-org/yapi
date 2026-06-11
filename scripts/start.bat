@echo off
title YApi

setlocal
set "ROOT=%~dp0.."
set "MODE=dev"

if /i "%1"=="/prod" set "MODE=start"

if not exist "%ROOT%\server\.env.local" (
    if exist "%ROOT%\server\.env.example" (
        copy "%ROOT%\server\.env.example" "%ROOT%\server\.env.local" >nul
        echo [start] Copied server\.env.example to server\.env.local, please edit and restart
    ) else (
        echo [start] server\.env.example not found
        pause
        exit /b 1
    )
)

if "%MODE%"=="start" (
    echo [start] Starting YApi in production mode...
) else (
    echo [start] Starting YApi in development mode...
)

start "YApi-Server" cmd /c "pnpm --filter yapi-server %MODE%"
start "YApi-Client" cmd /c "pnpm --filter yapi-client %MODE%"

echo [start] Server and Client started in new windows. Close them to stop.
endlocal
