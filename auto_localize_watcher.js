#!/usr/bin/env node
/**
 * Antigravity & VS Code 擴充套件 自動版本變化監控、自癒與繁體中文化守護程式 (v2.1 跨平台版)
 * 支援 macOS 與 Windows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const DIR = __dirname;
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

const LOG_FILE = path.join(DIR, 'autolocalize.log');
const EXTENSIONS_DIR = path.join(os.homedir(), '.vscode', 'extensions');

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
        if (IS_MAC) {
            const safeTitle = title.replace(/"/g, '\\"');
            const safeMsg = message.replace(/"/g, '\\"');
            execSync(`osascript -e 'display notification "${safeMsg}" with title "${safeTitle}" sound name "Glass"'`);
        } else if (IS_WIN) {
            // Windows PowerShell 通知 (Best-effort)
            const psScript = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$textNodes = $template.GetElementsByTagName("text")
$textNodes.Item(0).AppendChild($template.CreateTextNode("${title}")) | Out-Null
$textNodes.Item(1).AppendChild($template.CreateTextNode("${message}")) | Out-Null
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Antigravity")
$notifier.Show([Windows.UI.Notifications.ToastNotification]::new($template))
`;
            execSync(`powershell -WindowStyle Hidden -Command "${psScript.replace(/\r?\n/g, ' ')}"`, { stdio: 'ignore' });
        }
    } catch (e) {}
}

function getAppInfo() {
    if (IS_MAC) {
        const appPath = '/Applications/Antigravity.app';
        const asarPath = path.join(appPath, 'Contents', 'Resources', 'app.asar');
        const appSupport = path.join(os.homedir(), 'Library', 'Application Support', 'Antigravity');
        return { appPath, asarPath, appSupport };
    } else if (IS_WIN) {
        const candidates = [
            process.env.ANTIGRAVITY_INSTALL_DIR,
            process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity') : null,
            'C:\\Program Files\\Antigravity',
            'C:\\Programs\\Antigravity'
        ].filter(Boolean);

        for (const c of candidates) {
            const asar = path.join(c, 'resources', 'app.asar');
            if (fs.existsSync(asar)) {
                const appSupport = process.env.APPDATA ? path.join(process.env.APPDATA, 'Antigravity') : null;
                return { appPath: c, asarPath: asar, appSupport };
            }
        }
        return { appPath: null, asarPath: null, appSupport: null };
    }
    return { appPath: null, asarPath: null, appSupport: null };
}

/**
 * 任務 1：清理 Electron V8 Bytecode & GPU 快取
 */
function cleanElectronCache(appSupportDir) {
    if (!appSupportDir || !fs.existsSync(appSupportDir)) return;
    const cacheDirs = ['Cache', 'Code Cache', 'GPUCache', 'DawnWebGPUCache', 'DawnGraphiteCache'];
    let cleaned = 0;
    for (const cName of cacheDirs) {
        const target = path.join(appSupportDir, cName);
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
function checkAndLocalizeApp(appInfo) {
    const { appPath, asarPath, appSupport } = appInfo;
    if (!asarPath || !fs.existsSync(asarPath)) {
        return false;
    }

    // 檢查 app.asar 是否包含繁體中文特徵詞「命令選擇區」
    const asarBuf = fs.readFileSync(asarPath);
    const needle = Buffer.from('命令選擇區', 'utf8');
    const isLocalized = asarBuf.indexOf(needle) !== -1;

    if (!isLocalized) {
        log('⚡ 偵測到 Antigravity 官方更新（新版英文官方包），啟動自動中文化流程...');

        const bakAsar = asarPath + '.bak';
        try {
            fs.copyFileSync(asarPath, bakAsar);
            log('📦 已將最新官方英文版原檔備份至 app.asar.bak');
        } catch (e) {
            log(`⚠️ 備份 app.asar.bak 失敗: ${e.message}`);
        }

        const buildDir = path.join(DIR, 'build_app');
        const engineScript = path.join(DIR, 'localization_engine.js');

        // 重新編譯繁中資源包，使用 process.execPath 確保在 LaunchAgent/排程環境下 100% 成功執行
        const customEnv = Object.assign({}, process.env, {
            PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH || ''}:/usr/bin:/bin:/usr/sbin:/sbin`
        });
        execSync(`"${process.execPath}" "${engineScript}" --tw --brand-title english --install-dir "${buildDir}" --no-kill`, {
            cwd: DIR,
            stdio: 'inherit',
            env: customEnv
        });

        const patchAsar = path.join(buildDir, 'app.asar');
        const tmpAsar = asarPath + '.tmp';

        // 原子置換寫入
        fs.copyFileSync(patchAsar, tmpAsar);
        fs.renameSync(tmpAsar, asarPath);
        log('✅ 繁體中文 app.asar 原子置換完成。');

        // 清理快取
        cleanElectronCache(appSupport);

        // macOS 平台重新代碼簽署
        if (IS_MAC && appPath) {
            try {
                execSync(`xattr -d -r com.apple.quarantine "${appPath}" 2>/dev/null || true`);
                execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'ignore' });
                log('✅ 已完成 macOS ad-hoc 程式碼簽署並移除隔離屬性。');
            } catch (e) {
                log(`⚠️ 程式碼簽署提示: ${e.message}`);
            }
        }

        log('🎉 Antigravity 自動繁體中文化全流程處理完畢！');
        notify('Antigravity 自動中文化', '偵測到 Antigravity IDE 官方更新，已自動為新版本完成繁中化！請重啟應用程式生效。');
        return true;
    }
    return false;
}

/**
 * 任務 4：VS Code 官方擴充套件版本巡檢與自動中文化
 */
function checkAndLocalizeVsCodeExtension() {
    if (!fs.existsSync(EXTENSIONS_DIR)) {
        return false;
    }

    const entries = fs.readdirSync(EXTENSIONS_DIR);
    const matches = entries
        .filter(name => name.startsWith('google.google-antigravity-'))
        .sort((a, b) => b.localeCompare(a));

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
        const customEnv = Object.assign({}, process.env, {
            PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH || ''}:/usr/bin:/bin:/usr/sbin:/sbin`
        });
        execSync(`"${process.execPath}" "${localizeScript}"`, { cwd: DIR, stdio: 'inherit', env: customEnv });

        log(`🎉 VS Code 擴充套件 (${matches[0]}) 自動繁體中文化已完成！`);
        notify('Antigravity 自動中文化', `偵測到 VS Code 擴充套件更新 (${matches[0]})，已自動完成繁體中文化！`);
        return true;
    }
    return false;
}

function main() {
    try {
        checkAndHealMcpHealth();
        const appInfo = getAppInfo();
        const appChanged = checkAndLocalizeApp(appInfo);
        const extChanged = checkAndLocalizeVsCodeExtension();

        if (!appChanged && !extChanged) {
            // 静默安全日誌，不頻繁刷屏
        }
    } catch (err) {
        log(`❌ 自動中文化監控執行異常: ${err.message}`);
    }
}

main();
