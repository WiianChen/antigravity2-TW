#!/bin/bash
set -e

PLIST_NAME="com.antigravity.autolocalize.plist"
TARGET_PLIST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "=========================================================="
echo "    Antigravity macOS 背景自動更新守護服務 卸載工具"
echo "=========================================================="

if [ -f "$TARGET_PLIST" ]; then
    echo "⚡ 正在停止背景常駐守護服務..."
    launchctl unload "$TARGET_PLIST" 2>/dev/null || true
    rm -f "$TARGET_PLIST"
    echo "✅ 已成功移除 LaunchAgents 排程設定檔：$TARGET_PLIST"
else
    echo "ℹ️ 未在系統中偵測到已註冊的背景守護服務設定檔。"
fi

echo ""
echo "🎉 macOS 背景自動更新守護服務已完全停止並卸載！"
echo "未來官方若發布版本更新，Antigravity 將保持官方原版設定，不再自動重套繁體中文。"
echo "若日後需要重新啟用，可隨時執行 install_macos_autowatcher.sh 再次註冊。"
echo "=========================================================="
