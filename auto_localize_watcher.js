#!/usr/bin/env node
/**
 * Antigravity & VS Code 擴充套件 自動版本變化監控、自癒與繁體中文化守護程式 (v2.2 跨平台版)
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

function getCustomEnv() {
    const nodeDir = path.dirname(process.execPath);
    const extraPaths = IS_MAC
        ? ['/usr/local/bin', '/opt/homebrew/bin', '/opt/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin']
        : [];
    const currentPaths = (process.env.PATH || '').split(path.delimiter);
    const combined = Array.from(new Set([nodeDir, ...extraPaths, ...currentPaths])).filter(Boolean);
    return Object.assign({}, process.env, {
        PATH: combined.join(path.delimiter)
    });
}

function compareVersions(a, b) {
    const getParts = (str) => {
        const m = str.match(/google\.google-antigravity-(\d+)\.(\d+)\.(\d+)/);
        return m ? m.slice(1).map(Number) : [0, 0, 0];
    };
    const vA = getParts(a);
    const vB = getParts(b);
    for (let i = 0; i < 3; i++) {
        if (vB[i] !== vA[i]) {
            return vB[i] - vA[i];
        }
    }
    return b.localeCompare(a);
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

function checkAndLocalizeApp(appInfo) {
    const { appPath, asarPath, appSupport } = appInfo;
    if (!asarPath || !fs.existsSync(asarPath)) {
        return false;
    }

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

        const stageDir = path.join(DIR, '_staging_app');
        if (fs.existsSync(stageDir)) {
            fs.rmSync(stageDir, { recursive: true, force: true });
        }
        fs.mkdirSync(stageDir, { recursive: true });

        const stageAsar = path.join(stageDir, 'app.asar');
        fs.copyFileSync(asarPath, stageAsar);

        const unpackedDir = asarPath + '.unpacked';
        if (fs.existsSync(unpackedDir)) {
            const stageUnpacked = stageAsar + '.unpacked';
            try {
                fs.cpSync(unpackedDir, stageUnpacked, { recursive: true });
            } catch (e) {
                log(`⚠️ 複製 app.asar.unpacked 提示: ${e.message}`);
            }
        }

        const engineScript = path.join(DIR, 'localization_engine.js');
        const customEnv = getCustomEnv();

        try {
            execSync(`"${process.execPath}" "${engineScript}" --tw --brand-title english --install-dir "${stageDir}" --no-kill`, {
                cwd: DIR,
                stdio: 'inherit',
                env: customEnv
            });
        } catch (buildErr) {
            log(`❌ 暫存建置失敗，取消置換以保護原始檔案完整性: ${buildErr.message}`);
            try { fs.rmSync(stageDir, { recursive: true, force: true }); } catch (e) {}
            return false;
        }

        if (!fs.existsSync(stageAsar)) {
            log('❌ 暫存建置未產出 app.asar，取消置換。');
            try { fs.rmSync(stageDir, { recursive: true, force: true }); } catch (e) {}
            return false;
        }

        const stageBuf = fs.readFileSync(stageAsar);
        if (stageBuf.indexOf(needle) === -1) {
            log('❌ 暫存 app.asar 未包含繁中特徵詞，取消置換。');
            try { fs.rmSync(stageDir, { recursive: true, force: true }); } catch (e) {}
            return false;
        }

        const tmpAsar = asarPath + '.tmp';
        fs.copyFileSync(stageAsar, tmpAsar);
        fs.renameSync(tmpAsar, asarPath);
        log('✅ 繁體中文 app.asar 原子置換完成。');

        try { fs.rmSync(stageDir, { recursive: true, force: true }); } catch (e) {}
        cleanElectronCache(appSupport);

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

function checkAndLocalizeVsCodeExtension() {
    if (!fs.existsSync(EXTENSIONS_DIR)) {
        return false;
    }

    const entries = fs.readdirSync(EXTENSIONS_DIR);
    const matches = entries
        .filter(name => name.startsWith('google.google-antigravity-'))
        .sort(compareVersions);

    if (matches.length === 0) {
        return false;
    }

    const latestExtDir = path.join(EXTENSIONS_DIR, matches[0]);
    const pkgPath = path.join(latestExtDir, 'package.json');
    const extJsPath = path.join(latestExtDir, 'extension.js');

    if (!fs.existsSync(pkgPath)) {
        return false;
    }

    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    let isLocalized = pkgContent.includes('聚焦 Antigravity 面板');
    if (fs.existsSync(extJsPath)) {
        const extContent = fs.readFileSync(extJsPath, 'utf8');
        if (!extContent.includes('重新載入視窗')) {
            isLocalized = false;
        }
    }

    if (!isLocalized) {
        log(`⚡ 偵測到 VS Code 擴充套件更新或未完全中文化 (${matches[0]})，啟動自動中文化...`);
        const localizeScript = path.join(DIR, 'localize_vscode_extension.js');
        const customEnv = getCustomEnv();
        execSync(`"${process.execPath}" "${localizeScript}"`, { cwd: DIR, stdio: 'inherit', env: customEnv });

        log(`🎉 VS Code 擴充套件 (${matches[0]}) 自動繁體中文化已完成！`);
        notify('Antigravity 自動中文化', `偵測到 VS Code 擴充套件更新 (${matches[0]})，已自動完成繁體中文化！`);
        return true;
    }
    return false;
}

function main() {
    if (fs.existsSync(path.join(DIR, '.disable_autowatcher'))) {
        log('ℹ️ 偵測到停用標記檔 (.disable_autowatcher)，略過本次自動檢查。');
        return;
    }
    try {
        const appInfo = getAppInfo();
        const appChanged = checkAndLocalizeApp(appInfo);
        const extChanged = checkAndLocalizeVsCodeExtension();

        if (!appChanged && !extChanged) {
            // 静默安全日誌
        }
    } catch (err) {
        log(`❌ 自動中文化監控執行異常: ${err.message}`);
        process.exitCode = 1;
    }
}

main();
