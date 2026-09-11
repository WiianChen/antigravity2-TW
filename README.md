# Antigravity 2.0 繁體中文（台灣，zh-TW）最佳化套件 & 守護引擎

> 專為台灣開發者打造的 Google Antigravity 繁體中文在地化解決方案。  
> 全面解決簡轉繁機器翻譯硬套問題，100% 對齊 macOS / VS Code 台灣標準軟體用語。

[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-blue.svg)](#-極速安裝指南)
[![Locale](https://img.shields.io/badge/Locale-繁體中文%20(台灣%20zh--TW)-brightgreen.svg)](#-為什麼選擇台灣最佳化版)
[![Antigravity](https://img.shields.io/badge/Antigravity-v2.12.2%2B%20Compatible-orange.svg)](#)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Supported-purple.svg)](#-vs-code-官方擴充套件中文化)

👉 **[簡體中文版說明 (Simplified Chinese README)](README_CN.md)**

---

## 🌟 為什麼選擇台灣最佳化版？

市面現有漢化包多數由中國大陸社群製作，直接將簡體字轉為繁體，殘留大量機器翻譯錯誤與非台灣標準術語。本專案進行了全量字典校訂與核心引擎重構：

### 1. 專業詞彙 100% 對齊台灣軟體體例
| 原版簡轉繁 / 機器翻譯 | 台灣 macOS / 開發者標準繁體 | 修正重點說明 |
| :--- | :--- | :--- |
| **中古文件資源** | **Firestore 資料庫中儲存的文件** | 修正將 Firestore documents 誤譯為歷史古物的嚴重錯誤 |
| **命令面板** | **命令選擇區** | 對齊 VS Code 繁體中文標準命名（Command Palette） |
| **終端命令** | **終端機指令** | 對齊 macOS 終端機與台灣程式開發語境 |
| **未配置計劃任務** | **未設定排程任務** | 修正排程與設定用語 |
| **智能體** | **代理** | AI 領域標準稱呼（Agent） |
| **本地** | **本機** | Local 對應本機 |
| **Git 倉庫** | **Git 儲存庫** | Repository 正式繁體譯名 |
| **可復用** | **可重複使用** | 修正對岸簡化句型 |
| **暫無會話** | **尚無對話記錄** | 語意更清晰流暢 |
| **確定** | **好** | 對齊 macOS 對話框標準按鈕名稱 |
| **反重力智慧引擎** | **Antigravity** | 品牌名稱統一鎖定官方英文，避免過度漢化破壞辨識度 |

### 2. 核心底層修復與穩定性增強（獨家）
- **官方更新備份即時同步**：修復原專案「更新後備份檔仍停留在舊版，導致還原退回遠古版本」的邏輯缺陷。當偵測到官方釋出新版本時，自動刷新 `app.asar.bak`。
- **快取自動清理（V8 Bytecode & GPU Cache）**：更新注入後自動清空 Electron 的 `Cache`、`Code Cache` 與 `GPUCache`，徹底根絕「更新後部分介面仍顯示舊英文快取」或破圖現象。
- **macOS Gatekeeper 隔離旗標防護**：自動清除應用程式包的 `com.apple.quarantine` 屬性，杜絕系統彈出「應用程式已損毀無法開啟」警告。
- **VS Code 官方擴充套件雙重支援**：除了獨立版 Antigravity IDE，亦支援 Visual Studio Code 官方外掛 `google.google-antigravity` 的繁體中文化。
- **macOS 背景自動守護服務（LaunchAgent）**：官方發布大版本更新時，系統在背景自動重新完成繁體中文化注入，完全免手動重複操作。

---

## 📸 介面效果展示

### 1. 歡迎頁與登入新手導引
![歡迎頁與登入新手導引](./showimg/showlogin_tw.png)

### 2. 主編輯器介面與選單
![主編輯器介面與選單](./showimg/showmain_tw.png)

### 3. 詳細參數設定面板
![詳細參數設定面板](./showimg/showmenu_tw.png)

---

## 🚀 極速安裝指南（獨立桌面版 IDE）

### 步驟 1：取得專案檔案（二選一）

- **方法 A（推薦：直接下載 ZIP）**：
  1. 點擊本頁右上角綠色按鈕 **`Code`** → 選擇 **`Download ZIP`**。
  2. 解壓縮至電腦任意資料夾（例如「下載」資料夾）。

- **方法 B（Git 複製）**：
  ```bash
  git clone https://github.com/atonnyshen/antigravity2-TW.git
  cd antigravity2-TW
  ```

### 步驟 2：執行一鍵套用

1. **完全關閉** Antigravity 應用程式。
2. 進入解壓後的資料夾：
   - **macOS 使用者**：雙擊執行 **`双击安装繁体中文.command`**（或於終端機執行 `bash 套用繁體中文化.command`）。
   - **Windows 使用者**：雙擊執行 **`双击安装繁体中文.bat`**。
3. 依提示選擇左上角品牌呈現方式（直接按 Enter 預設保留官方英文 `Antigravity`）。
4. 重新啟動 Antigravity，即可進入全繁體中文（台灣）開發環境！

---

## 💻 VS Code 官方擴充套件中文化

若您使用的是 Visual Studio Code 並安裝了 `Google Antigravity` 官方擴充套件：

1. 確保 Visual Studio Code 處於開啟或關閉狀態皆可。
2. 在本專案資料夾內執行：
   - **macOS**：雙擊執行 **`套用VSCode擴充繁體中文化.command`**（或終端機執行 `node localize_vscode_extension.js`）。
3. 重新啟動 VS Code，指令選擇區（Command Palette）中的 Antigravity 指令與擴充設定即刻變更為繁體中文！

---

## 🛡️ 進階功能：macOS 背景自動更新守護（有更新自動重修）

Antigravity 官方在發布大版本自動更新後，會覆蓋 `app.asar` 暫時回到英文。本專案提供 macOS 原生 `launchd` 守護方案，偵測到版本變化時於背景自動重新注入繁中：

```bash
# 啟用背景自動守護服務（只需設定一次）
cp com.antigravity.autolocalize.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.antigravity.autolocalize.plist
```

- 官方一釋出更新覆蓋檔案，系統毫秒級自動重新編譯並簽署。
- 自動清理舊快取並彈出 macOS 原生通知：「偵測到官方更新，已自動為新版本完成繁中化！」。
- 日常未更新時耗時僅 0.05 秒即休眠，零 CPU 與記憶體開銷。

---

## 🔄 一鍵卸載還原官方英文

若需隨時還原至官方原版英文狀態：
- **macOS**：雙擊執行 **`双击卸载还原官方英文.command`**。
- **Windows**：雙擊執行 **`双击卸载还原官方英文.bat`**。
- **VS Code 外掛還原**：執行 `node localize_vscode_extension.js --restore`。

所有備份檔均完好保存，一秒即可無痕還原。

---

## 🤝 致謝與開源聲明

- 本專案底層架構源自 [qqxpee/antigravity2-cn](https://github.com/qqxpee/antigravity2-cn)，感謝原作者初期對 ASAR 注入技術的探索。
- 本版本由台灣開源社群獨立維護，致力於提供最精準、優雅、符合台灣開發者直覺的在地化體驗。
- 歡迎提交 Issue 與 Pull Request 一起完善字典詞條！
