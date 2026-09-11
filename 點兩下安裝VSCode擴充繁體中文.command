#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================================="
echo "  正在為 VS Code Antigravity 擴充套件（官方套件與儀表板）安裝繁體中文"
echo "=========================================================="
node localize_vscode_extension.js
echo ""
echo "視窗將在 5 秒後自動關閉（或按任意鍵立即關閉）..."
read -t 5 -n 1 -s
