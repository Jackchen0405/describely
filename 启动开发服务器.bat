@echo off
chcp 65001 >nul
title Describely — 开发服务器

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   Describely 跨境商品AI智能文案助手  ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [1/2] 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查 Node.js 是否已安装。
        pause
        exit /b 1
    )
    echo 依赖安装完成。
    echo.
) else (
    echo [1/2] 依赖已存在，跳过安装。
    echo.
)

echo [2/2] 启动开发服务器...
echo 浏览器打开 http://localhost:3000 即可使用。
echo 按 Ctrl+C 停止服务器。
echo.

call npm run dev

pause
