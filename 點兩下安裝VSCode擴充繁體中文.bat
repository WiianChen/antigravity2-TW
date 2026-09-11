@echo off
chcp 65001 > nul
title Antigravity - VS Code 擴充套件繁體中文化

echo.
echo ==========================================================
echo   正在為 VS Code Antigravity 擴充套件（官方套件與儀表板）安裝繁體中文
echo ==========================================================
cd /d "%~dp0"
node localize_vscode_extension.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ 錯誤: 安裝繁體中文失敗！請檢查上方訊息，確認是否已安裝 VS Code 擴充套件。
    pause
    exit /b 1
)

echo.
echo 視窗將在 5 秒後自動關閉...
timeout /t 5
