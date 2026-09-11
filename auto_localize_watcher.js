#!/usr/bin/env node
/**
 * Antigravity & VS Code 擴充套件 自動版本變化監控、自癒與繁體中文化守護程式 (v2.0)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const DIR = __dirname;
const APP_PATH = '/Applications/Antigravity.app';
const RESOURCES_PATH = path.join(APP_PATH, 'Contents', 'Resources');
const ASAR_PATH = path.join(RESOURCES_PATH, 'app.asar');
const EXTENSIONS_DIR = path.join(os.homedir(), '.vscode', 'extensions');
const APP_SUPPORT_DIR = path.join(os.homedir(), 'Library', 'Application Support', 'Antigravity');
const LOG_FILE = path.join(DIR, 'autolocalize.log');

function log(msg) {
    const time = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const line = `[${time}] ${msg}`;
    console.log(line);
    try {
        fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
    } catch (e) {}
}

function notify(title, message) {
    try {
        const safeTitle = title.replace(/"/g, '\\"');
        const safeMsg = message.replace(/"/g, '\\"');
        execSync(`osascript -e 'display notification "${safeMsg}" with title "${safeTitle}" sound name "Glass"'`);
    } catch (e) {}
}

/**
 * 任務 1：清理 Electron V8 Bytecode & GPU 快取
 * 避免官方更新覆蓋 app.asar 後，應用程式繼續讀取舊版本的快取資料
 */
function cleanElectronCache() {
    if (!fs.existsSync(APP_SUPPORT_DIR)) return;
    const cacheDirs = ['Cache', 'Code Cache', 'GPUCache', 'DawnWebGPUCache', 'DawnGraphiteCache'];
    let cleaned = 0;
    for (const cName of cacheDirs) {
        const target = path.join(APP_SUPPORT_DIR, cName);
        if (fs.existsSync(target)) {
            try {
                fs.rmSync(target, { recursive: true, force: true });
                cleaned++;
            } catch (e) {}
        }
    }
    if (cleaned > 0) {
        log(`🧹 已自動清理 ${cleaned} 個 Electron 快取目錄，防止舊版 bytecode 殘留。`);
    }
}

/**
 * 任務 2：MCP 設定與技能鏈路健康檢查與自癒
 * 防止更新後 MCP 發生 Error 或丟失符號連結
 */
function checkAndHealMcpHealth() {
    const workspace = path.join(os.homedir(), '工作區');
    const skillLink = path.join(workspace, '.agent', 'skills', 'open-design-bridge');
    const skillTarget = path.join(workspace, '.claude', 'skills_cold', 'open-design-bridge');

    if (!fs.existsSync(skillLink) && fs.existsSync(skillTarget)) {
        try {
            fs.symlinkSync(skillTarget, skillLink);
            log('🔧 [MCP 自癒] 已自動補全遺失的 open-design-bridge 符號連結。');
        } catch (e) {}
    }
}

/**
 * 任務 3：桌面客戶端檢查、更新備份與注入
 */
function checkAndLocalizeApp() {
    if (!fs.existsSync(ASAR_PATH)) {
        return false;
    }

    // 檢查 app.asar 是否包含繁體中文特徵詞「命令選擇區」
    const asarBuf = fs.readFileSync(ASAR_PATH);
    const needle = Buffer.from('命令選擇區', 'utf8');
    const isLocalized = asarBuf.indexOf(needle) !== -1;

    if (!isLocalized) {
        log('⚡ 偵測到 Antigravity.app 官方更新（新版英文官方包），啟動自動中文化流程...');

        const bakAsar = ASAR_PATH + '.bak';
        // 關鍵：將「當前新版官方英文包」及時備份，確保還原時為最新官方版本而非舊版本
        try {
            fs.copyFileSync(ASAR_PATH, bakAsar);
            log('📦 已將最新官方英文版原檔備份至 app.asar.bak');
        } catch (e) {
            log(`⚠️ 備份 app.asar.bak 失敗: ${e.message}`);
        }

        const buildDir = path.join(DIR, 'build_app');
        const engineScript = path.join(DIR, 'localization_engine.js');

        // 重新編譯繁中資源包
        execSync(`node "${engineScript}" --tw --brand-title english --install-dir "${buildDir}" --no-kill`, {
            cwd: DIR,
            stdio: 'inherit'
        });

        const patchAsar = path.join(buildDir, 'app.asar');
        const tmpAsar = ASAR_PATH + '.tmp';

        // 原子置換寫入
        fs.copyFileSync(patchAsar, tmpAsar);
        fs.renameSync(tmpAsar, ASAR_PATH);
        log('✅ 繁體中文 app.asar 原子置換完成。');

        // 清理快取
        cleanElectronCache();

        // 移除 Gatekeeper 隔離屬性並執行程式碼簽署
        try {
            execSync(`xattr -d -r com.apple.quarantine "${APP_PATH}" 2>/dev/null || true`);
            execSync(`codesign --force --deep --sign - "${APP_PATH}"`, { stdio: 'ignore' });
            log('✅ 已完成 macOS ad-hoc 程式碼簽署並移除隔離屬性。');
        } catch (e) {
            log(`⚠️ 程式碼簽署提示: ${e.message}`);
        }

        log('🎉 Antigravity.app 自動繁體中文化全流程處理完畢！');
        notify('Antigravity 自動中文化', '偵測到 Antigravity IDE 官方更新，已自動為新版本完成繁中化！請重啟應用程式生效。');
        return true;
    }
    return false;
}

/**
 * 任務 4：VS Code 擴充套件版本巡檢與自動中文化
 */
function checkAndLocalizeVsCodeExtension() {
    if (!fs.existsSync(EXTENSIONS_DIR)) {
        return false;
    }

    const entries = fs.readdirSync(EXTENSIONS_DIR);
    const matches = entries
        .filter(name => name.startsWith('google.google-antigravity-'))
        .sort((a, b) => b.localeCompare(a)); // 排序取最高/最新版本

    if (matches.length === 0) {
        return false;
    }

    const latestExtDir = path.join(EXTENSIONS_DIR, matches[0]);
    const pkgPath = path.join(latestExtDir, 'package.json');

    if (!fs.existsSync(pkgPath)) {
        return false;
    }

    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const isLocalized = pkgContent.includes('聚焦 Antigravity 面板');

    if (!isLocalized) {
        log(`⚡ 偵測到 VS Code 擴充套件更新 (${matches[0]})，啟動自動中文化...`);
        const localizeScript = path.join(DIR, 'localize_vscode_extension.js');
        execSync(`node "${localizeScript}"`, { cwd: DIR, stdio: 'inherit' });

        log(`🎉 VS Code 擴充套件 (${matches[0]}) 自動繁體中文化已完成！`);
        notify('Antigravity 自動中文化', `偵測到 VS Code 擴充套件更新 (${matches[0]})，已自動完成繁體中文化！`);
        return true;
    }
    return false;
}

function main() {
    try {
        checkAndHealMcpHealth();
        const appChanged = checkAndLocalizeApp();
        const extChanged = checkAndLocalizeVsCodeExtension();

        if (!appChanged && !extChanged) {
            // 静默安全日誌，不頻繁刷屏
        }
    } catch (err) {
        log(`❌ 自動中文化監控執行異常: ${err.message}`);
    }
}

main();
