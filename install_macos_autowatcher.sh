#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST_NAME="com.antigravity.autolocalize.plist"
TARGET_PLIST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "=========================================================="
echo "    Antigravity macOS 背景自動更新守護服務安裝工具"
echo "=========================================================="

NODE_BIN="$(which node || echo "/usr/local/bin/node")"

mkdir -p "$HOME/Library/LaunchAgents"

cat << PLIST_EOF > "$TARGET_PLIST"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.antigravity.autolocalize</string>
    <key>ProgramArguments</key>
    <array>
        <string>${NODE_BIN}</string>
        <string>${DIR}/auto_localize_watcher.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>WatchPaths</key>
    <array>
        <string>/Applications/Antigravity.app/Contents/Info.plist</string>
        <string>/Applications/Antigravity.app/Contents/Resources/app.asar</string>
        <string>${HOME}/.vscode/extensions</string>
    </array>
    <key>StartInterval</key>
    <integer>1800</integer>
    <key>WorkingDirectory</key>
    <string>${DIR}</string>
    <key>StandardOutPath</key>
    <string>${DIR}/autolocalize.log</string>
    <key>StandardErrorPath</key>
    <string>${DIR}/autolocalize.log</string>
</dict>
</plist>
PLIST_EOF

launchctl unload "$TARGET_PLIST" 2>/dev/null || true
launchctl load "$TARGET_PLIST"

echo "🎉 守護服務已成功安裝並啟動！"
echo "日後 Antigravity 或 VS Code 擴充套件更新時，將自動於背景為新版本重新完成繁體中文化。"
echo "=========================================================="
