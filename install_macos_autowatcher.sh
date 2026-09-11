#!/bin/bash
set -e
REPO_URL="https://github.com/atonnyshen/antigravity2-TW.git"
DEFAULT_INSTALL_DIR="$HOME/.antigravity2-TW"

echo "=========================================================="
echo "    Antigravity macOS 背景自動更新守護服務安裝工具"
echo "=========================================================="

if [ -f "$(pwd)/auto_localize_watcher.js" ]; then
    DIR="$(pwd)"
elif [ -f "$(dirname "$0")/auto_localize_watcher.js" ] 2>/dev/null; then
    DIR="$(cd "$(dirname "$0")" && pwd)"
else
    echo "⚡ 偵測到直接透過網路執行，正在下載或更新專案至 $DEFAULT_INSTALL_DIR ..."
    if [ -d "$DEFAULT_INSTALL_DIR/.git" ]; then
        git -C "$DEFAULT_INSTALL_DIR" pull --ff-only 2>/dev/null || true
    else
        git clone "$REPO_URL" "$DEFAULT_INSTALL_DIR"
    fi
    DIR="$DEFAULT_INSTALL_DIR"
fi

PLIST_NAME="com.antigravity.autolocalize.plist"
TARGET_PLIST="$HOME/Library/LaunchAgents/$PLIST_NAME"

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
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/opt/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>WatchPaths</key>
    <array>
        <string>/Applications/Antigravity.app/Contents/Info.plist</string>
        <string>/Applications/Antigravity.app/Contents/Resources/app.asar</string>
        <string>/Applications/Antigravity IDE.app/Contents/Info.plist</string>
        <string>/Applications/Antigravity IDE.app/Contents/Resources/app.asar</string>
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

# 驗證 plist 格式合法性
plutil -lint "$TARGET_PLIST" >/dev/null

launchctl unload "$TARGET_PLIST" 2>/dev/null || true
launchctl load "$TARGET_PLIST"

echo "🎉 守護服務已成功安裝並啟動！"
echo "服務工作目錄：$DIR"
echo "日後 Antigravity IDE 官方更新時，將自動於背景為新版本重新完成繁體中文化。"
echo "若日後需拉取最新繁中字典與程式碼，只需在終端機再次執行相同指令即可自動同步！"
echo "=========================================================="
