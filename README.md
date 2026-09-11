# Antigravity 台灣繁體中文在地化套件（antigravity2-TW）

> 專為台灣開發者校訂的 Google Antigravity 繁體中文（zh-TW）環境套件。  
> 修正簡中轉譯錯誤，對齊 macOS 與 VS Code 繁體中文介面規範，支援版本更新自癒守護。

[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-blue.svg)](#-極速安裝指引)
[![Locale](https://img.shields.io/badge/Locale-繁體中文%20(台灣%20zh--TW)-brightgreen.svg)](#-術語校訂對照)
[![Antigravity](https://img.shields.io/badge/Antigravity-v2.12.2%2B%20Compatible-orange.svg)](#)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Supported-purple.svg)](#-vs-code-官方擴充套件繁中化)

👉 **[簡體中文版說明 (Simplified Chinese README)](README_CN.md)**

---

## 📌 術語校訂對照

本套件針對現有社群漢化包進行全量字典校訂，排除機器硬翻與非台灣標準軟體詞彙：

| 原版簡中轉譯 | 台灣開發者標準繁體 | 校訂說明 |
| :--- | :--- | :--- |
| **中古文件資源** | **Firestore 資料庫中儲存的文件** | 修正將 Firestore documents 誤譯為歷史古物 |
| **命令面板** | **命令選擇區** | 對齊 VS Code 繁體中文介面規範（Command Palette） |
| **終端命令** | **終端機指令** | 對齊 macOS 終端機與台灣程式用語 |
| **未配置計劃任務** | **未設定排程任務** | 修正排程與設定動賓搭配 |
| **智能體** | **代理** | AI 領域標準稱呼（Agent） |
| **本地** | **本機** | Local 對應本機標準用語 |
| **Git 倉庫** | **Git 儲存庫** | Repository 正式繁體譯名 |
| **可復用** | **可重複使用** | 還原自然中文語序 |
| **暫無會話** | **尚無對話記錄** | 語意明確清晰 |
| **確定** | **好** | 對齊 macOS 對話框標準按鈕名稱 |
| **反重力智慧引擎** | **Antigravity** | 保留官方英文品牌標記，不破壞辨識度 |

---

## ⚙️ 核心機制

1. **同步備份檔案**：偵測官方發布新版本時，自動將全新英文包同步備份為 `app.asar.bak`，避免還原時退回舊版。
2. **清理執行快取**：資源注入後自動清空 Electron 的 `Cache`、`Code Cache` 與 `GPUCache`，排除舊版快取干擾。
3. **解除隔離旗標**：自動清除 macOS `com.apple.quarantine` 屬性並重簽 ad-hoc 憑證，杜絕系統阻擋提示。
4. **支援雙重環境**：同步支援獨立桌面版 IDE 與 Visual Studio Code 官方擴充套件（`google.google-antigravity`）。
5. **常駐背景守護**：提供 macOS `launchd` 原生守護服務，版本更動時自動於背景重編注入。

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
   - **macOS 使用者**：點兩下執行 **`點兩下安裝繁體中文.command`**。
   - **Windows 使用者**：點兩下執行 **`點兩下安裝繁體中文.bat`**。
3. 依提示選擇左上角品牌呈現方式（直接按 Enter 預設保留官方英文 `Antigravity`）。
4. 重新啟動 Antigravity，即可進入全繁體中文（台灣）開發環境！

---

## 💻 VS Code 官方擴充套件中文化

若您使用的是 Visual Studio Code 並安裝了 `Google Antigravity` 官方擴充套件：

1. 確保 Visual Studio Code 處於開啟或關閉狀態皆可。
2. 在本專案資料夾內執行：
   - **macOS 使用者**：點兩下執行 **`點兩下安裝VSCode擴充繁體中文.command`**。
   - **Windows 使用者**：點兩下執行 **`點兩下安裝VSCode擴充繁體中文.bat`**。
3. 重新啟動 VS Code，命令選擇區（Command Palette）中的 Antigravity 指令與擴充設定即刻變更為繁體中文！

---

## 🛡️ macOS 背景自動更新守護（有更新自動重套）

Antigravity 官方在發布大版本更新後會覆蓋 `app.asar` 資源檔。在終端機貼上下方一行指令，即可註冊系統背景常駐守護；日後官方更新時，系統將在背景自動重套繁中並跳出通知：

```bash
# 啟用背景自動守護服務（一行指令自動下載與配置）
curl -fsSL https://raw.githubusercontent.com/atonnyshen/antigravity2-TW/main/install_macos_autowatcher.sh | bash
```

- **官方更新自動重套**：偵測到官方更新覆蓋時，背景自動重新解包、置換資源並簽署憑證。
- **清除快取彈出通知**：自動清理 Electron 舊快取，並透過 macOS 原生通知提示使用者重啟生效。
- **隨時同步最新詞庫**：若需同步社群最新繁中字典與程式碼，在終端機再次執行同一行指令即可自動更新。
- **本機快速執行**：若已下載本專案，亦可直接在目錄內執行 `bash install_macos_autowatcher.sh`。

---

## 🔄 一鍵還原官方英文

若需隨時還原至官方原版英文狀態：

### 1. 桌面版 IDE 還原：
- **macOS 使用者**：點兩下執行 **`點兩下還原官方英文.command`**。
- **Windows 使用者**：點兩下執行 **`點兩下還原官方英文.bat`**。

### 2. VS Code 擴充套件還原：
- **macOS 使用者**：點兩下執行 **`點兩下還原VSCode擴充官方英文.command`**。
- **Windows 使用者**：點兩下執行 **`點兩下還原VSCode擴充官方英文.bat`**。

所有備份檔均完好保存，一秒即可無痕還原。

---

## 🤝 致謝與開源聲明

- 本專案底層架構源自 [qqxpee/antigravity2-cn](https://github.com/qqxpee/antigravity2-cn)，感謝原作者初期對 ASAR 注入技術的探索。
- 本版本由台灣開源社群獨立維護，致力於提供最精準、優雅、符合台灣開發者直覺的在地化體驗。
- 歡迎提交 Issue 與 Pull Request 一起完善字典詞條！
