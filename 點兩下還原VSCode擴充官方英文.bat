@echo off
chcp 65001 > nul
title Antigravity - VS Code 擴充套件還原官方原版英文

echo.
echo ==========================================================
echo   正在還原 VS Code Antigravity 擴充套件（官方套件與儀表板）為原版英文
echo ==========================================================
cd /d "%~dp0"
node localize_vscode_extension.js --restore

if %errorlevel% neq 0 (
    echo.
    echo ❌ 錯誤: 還原失敗！請檢查上方訊息。
    pause
    exit /b 1
)

echo.
echo 視窗將在 5 秒後自動關閉...
timeout /t 5
