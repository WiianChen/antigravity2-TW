#!/bin/bash
set -e

PLIST_NAME="com.antigravity.autolocalize.plist"
LABEL="com.antigravity.autolocalize"
TARGET_PLIST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "=========================================================="
echo "    Antigravity macOS 背景自動更新守護服務 卸載工具"
echo "=========================================================="

echo "⚡ 正在停止背景常駐守護服務..."
if [ -f "$TARGET_PLIST" ]; then
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || launchctl unload "$TARGET_PLIST" 2>/dev/null || true
    rm -f "$TARGET_PLIST"
    echo "✅ 已成功移除 LaunchAgents 排程設定檔：$TARGET_PLIST"
else
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    echo "ℹ️ 未在檔案系統中偵測到設定檔，已嘗試卸載可能殘留之服務。"
fi

# 再次確認服務是否已退出
if launchctl list | grep -q "$LABEL"; then
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
fi

echo ""
echo "🎉 macOS 背景自動更新守護服務已完全停止並卸載！"
echo "未來官方若發布版本更新，Antigravity 將保持官方原版設定，不再自動重套繁體中文。"
echo "若日後需要重新啟用，可隨時執行 install_macos_autowatcher.sh 再次註冊。"
echo "=========================================================="
