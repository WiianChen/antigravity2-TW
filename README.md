# Antigravity 台灣繁體中文在地化套件（antigravity2-TW）

> 本專案底層注入架構奠基於原作者 [qqxpee/antigravity2-cn](https://github.com/qqxpee/antigravity2-cn) 的開源成果。  
> 核心的 Electron ASAR 解包、重新打包與程式碼注入機制均由原作者研發完成。  
> 
> 我在日常使用時，因習慣台灣的繁體中文開發語境，便在原作者的技術架構之上，校訂了一套符合 macOS 與 VS Code 標準的繁體中文（zh-TW）詞庫，並順手補強了版本更新時的備份同步與快取清理機制，方便有相同需求的台灣開發者直接取用。

[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-blue.svg)](#-極速安裝指引)
[![Locale](https://img.shields.io/badge/Locale-繁體中文%20(台灣%20zh--TW)-brightgreen.svg)](#-術語校訂對照)
[![Upstream](https://img.shields.io/badge/Upstream-qqxpee%2Fantigravity2--cn-lightgrey.svg)](https://github.com/qqxpee/antigravity2-cn)

👉 **[原版簡體中文說明 (Upstream README)](README_CN.md)**

---

## 📌 術語校訂重點

原版簡中轉譯在台灣日常軟體操作中較易出戲，這裡依據 macOS 與 VS Code 繁體中文慣例進行校訂：

| 原版簡中轉譯 | 台灣開發者標準繁體 | 校訂說明 |
| :--- | :--- | :--- |
| **命令面板** | **命令選擇區** | 對齊 VS Code 繁體中文介面規範（Command Palette） |
| **代碼倉庫 / Git 倉庫** | **儲存庫 / Git 儲存庫** | Repository 正式軟體體例 |
| **智能體** | **代理** | AI 領域標準稱呼（Agent） |
| **未配置計劃任務** | **未設定排程任務** | 修正排程與設定習慣用語 |
| **終端命令** | **終端機指令** | 對齊 macOS 終端機與開發用語 |
| **本地** | **本機** | Local 對應本機標準用語 |
| **Token 預算超限** | **Token 預算額度已超限** | 語意完整明確 |
| **可復用** | **可重複使用** | 還原自然中文語序 |
| **暫無會話** | **尚無對話記錄** | 語意清晰 |
| **確定** | **好** | 對齊 macOS 對話框標準確認按鈕 |
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

- 特別感謝 [qqxpee/antigravity2-cn](https://github.com/qqxpee/antigravity2-cn) 原作者的開源貢獻與 ASAR 注入架構設計。
- 本儲存庫為個人使用與分享版本，主要維護繁體中文語境字典與自動更新腳本。
- 若使用時發現漏譯或語意不順的詞條，歡迎隨時提交 Issue 或 PR 共同補充！
