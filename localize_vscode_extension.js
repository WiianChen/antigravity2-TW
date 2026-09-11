#!/usr/bin/env node
/**
 * Google Antigravity VS Code 擴充套件 繁體中文化工具 (zh-TW)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const EXTENSIONS_DIR = path.join(os.homedir(), '.vscode', 'extensions');

function findExtensionDir() {
    if (!fs.existsSync(EXTENSIONS_DIR)) {
        throw new Error(`找不到 VS Code 擴充套件目錄：${EXTENSIONS_DIR}`);
    }
    const entries = fs.readdirSync(EXTENSIONS_DIR);
    const matches = entries
        .filter(name => name.startsWith('google.google-antigravity-'))
        .sort((a, b) => b.localeCompare(a)); // 取最新版本

    if (matches.length === 0) {
        throw new Error('未在 ~/.vscode/extensions/ 中找到 google.google-antigravity 擴充套件');
    }
    return path.join(EXTENSIONS_DIR, matches[0]);
}

const COMMAND_TRANSLATIONS = {
    'Show Third Party Notices': '顯示第三方聲明',
    'Reset Conversation State': '重設對話狀態',
    'Add Selection to Chat': '將選取內容加入對話',
    'Focus Antigravity Panel': '聚焦 Antigravity 面板',
    'Accept All Changes': '接受所有變更',
    'Reject All Changes': '拒絕所有變更',
    'Toggle Inline Diff': '切換行內差異比對',
    'Open Antigravity Settings': '開啟 Antigravity 設定'
};

const CONFIG_TRANSLATIONS = {
    'antigravity.serverPort': 'Antigravity 背景伺服器連接埠 (`agy --hub`)。保持為 0 則自動配置動態連接埠。',
    'antigravity.enableTelemetry': '啟用傳送用戶端產品遙測與使用量指標至 Google Cloudmill 以協助改善 Antigravity。',
    'antigravity.enableInlineDiff': '啟用行內差異比對裝飾與 CodeLens。停用時將回退為在並排差異分頁中開啟變更。',
    'antigravity.autoOpenFiles': '當代理提議編輯時，自動在編輯器中開啟檔案。',
    'antigravity.channel': '此擴充套件組件的發行通道'
};

const EDITOR_TRANSLATIONS = {
    'Antigravity Artifact Viewer': 'Antigravity 產出檢視器',
    'Antigravity Settings Viewer': 'Antigravity 設定檢視器'
};

function localizePackageJson(extDir, isRestore = false) {
    const pkgPath = path.join(extDir, 'package.json');
    const bakPath = path.join(extDir, 'package.json.bak');

    if (isRestore) {
        if (fs.existsSync(bakPath)) {
            fs.copyFileSync(bakPath, pkgPath);
            console.log('✅ 已還原 package.json');
        }
        return;
    }

    if (!fs.existsSync(bakPath)) {
        fs.copyFileSync(pkgPath, bakPath);
        console.log('📦 已建立 package.json.bak 備份');
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // 翻譯 commands
    if (pkg.contributes && pkg.contributes.commands) {
        for (const cmd of pkg.contributes.commands) {
            if (COMMAND_TRANSLATIONS[cmd.title]) {
                cmd.title = COMMAND_TRANSLATIONS[cmd.title];
            }
        }
    }

    // 翻譯 customEditors
    if (pkg.contributes && pkg.contributes.customEditors) {
        for (const ed of pkg.contributes.customEditors) {
            if (EDITOR_TRANSLATIONS[ed.displayName]) {
                ed.displayName = EDITOR_TRANSLATIONS[ed.displayName];
            }
        }
    }

    // 翻譯 configuration
    if (pkg.contributes && pkg.contributes.configuration && pkg.contributes.configuration.properties) {
        const props = pkg.contributes.configuration.properties;
        for (const [key, desc] of Object.entries(CONFIG_TRANSLATIONS)) {
            if (props[key]) {
                props[key].description = desc;
            }
        }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t'), 'utf8');
    console.log('✅ package.json 指令與設定繁體中文化完成！');
}

function localizeExtensionJs(extDir, isRestore = false) {
    const extJsPath = path.join(extDir, 'extension.js');
    const bakPath = path.join(extDir, 'extension.js.bak');

    if (isRestore) {
        if (fs.existsSync(bakPath)) {
            fs.copyFileSync(bakPath, extJsPath);
            console.log('✅ 已還原 extension.js');
        }
        return;
    }

    if (!fs.existsSync(bakPath)) {
        fs.copyFileSync(extJsPath, bakPath);
        console.log('📦 已建立 extension.js.bak 備份');
    }

    let code = fs.readFileSync(extJsPath, 'utf8');

    // 替換載入提示
    code = code.replace(
        `getLoadingContentHtml('Loading Antigravity...')`,
        `getLoadingContentHtml('載入 Antigravity 中...')`
    );
    code = code.replace(
        `'Connecting to Remote Antigravity tunnel ('`,
        `'正在連線至遠端 Antigravity 通道 ('`
    );
    code = code.replace(
        `'Could not connect to remote port. Please check VS Code Ports tab.'`,
        `'無法連線至遠端連接埠。請檢查 VS Code 連接埠分頁。'`
    );
    code = code.replace(
        `>Update</button>`,
        `>更新</button>`
    );

    fs.writeFileSync(extJsPath, code, 'utf8');
    console.log('✅ extension.js 介面與載入流程繁體中文化完成！');
}

function main() {
    const args = process.argv.slice(2);
    const isRestore = args.includes('--restore');

    try {
        const extDir = findExtensionDir();
        console.log(`==========================================================`);
        console.log(`  Google Antigravity VS Code 擴充套件繁體中文化工具`);
        console.log(`==========================================================`);
        console.log(`目標目錄：${extDir}`);

        localizePackageJson(extDir, isRestore);
        localizeExtensionJs(extDir, isRestore);

        console.log(`==========================================================`);
        if (isRestore) {
            console.log(`🎉 擴充套件已成功還原為官方英文原版！請重啟 VS Code。`);
        } else {
            console.log(`🎉 恭喜！VS Code 擴充套件繁體中文化已完成。請重啟 VS Code！`);
        }
        console.log(`==========================================================`);
    } catch (err) {
        console.error(`❌ 執行失敗：`, err.message);
        process.exit(1);
    }
}

main();
