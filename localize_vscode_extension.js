#!/usr/bin/env node
/**
 * Google Antigravity VS Code 擴充套件 繁體中文化工具 (zh-TW)
 * 支援：
 * 1. 官方 Google Antigravity 擴充套件 (google.google-antigravity)
 * 2. Antigravity Cockpit 配額儀表板擴充套件 (jlcodes.antigravity-cockpit)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const EXTENSIONS_DIR = path.join(os.homedir(), '.vscode', 'extensions');

function findInstalledExtensions() {
    if (!fs.existsSync(EXTENSIONS_DIR)) {
        throw new Error(`找不到 VS Code 擴充套件目錄：${EXTENSIONS_DIR}`);
    }
    const entries = fs.readdirSync(EXTENSIONS_DIR);
    
    // 官方 Antigravity 擴充套件
    const officialMatches = entries
        .filter(name => name.startsWith('google.google-antigravity-'))
        .sort((a, b) => b.localeCompare(a));

    // Antigravity Cockpit 擴充套件
    const cockpitMatches = entries
        .filter(name => name.startsWith('jlcodes.antigravity-cockpit-'))
        .sort((a, b) => b.localeCompare(a));

    return {
        official: officialMatches.length > 0 ? path.join(EXTENSIONS_DIR, officialMatches[0]) : null,
        cockpit: cockpitMatches.length > 0 ? path.join(EXTENSIONS_DIR, cockpitMatches[0]) : null
    };
}

/* ==========================================================
 * 1. 官方擴充套件 (google.google-antigravity) 字典與中文化
 * ========================================================== */

const OFFICIAL_COMMAND_TRANSLATIONS = {
    'Show Third Party Notices': '顯示第三方聲明',
    'Reset Conversation State': '重設對話狀態',
    'Add Selection to Chat': '將選取內容加入對話',
    'Focus Antigravity Panel': '聚焦 Antigravity 面板',
    'Accept All Changes': '接受所有變更',
    'Reject All Changes': '拒絕所有變更',
    'Toggle Inline Diff': '切換行內差異比對',
    'Open Antigravity Settings': '開啟 Antigravity 設定'
};

const OFFICIAL_CONFIG_TRANSLATIONS = {
    'antigravity.serverPort': 'Antigravity 背景伺服器連接埠 (`agy --hub`)。保持為 0 則自動配置動態連接埠。',
    'antigravity.enableTelemetry': '啟用傳送用戶端產品遙測與使用量指標至 Google Cloudmill 以協助改善 Antigravity。',
    'antigravity.enableInlineDiff': '啟用行內差異比對裝飾與 CodeLens。停用時將回退為在並排差異分頁中開啟變更。',
    'antigravity.autoOpenFiles': '當代理提議編輯時，自動在編輯器中開啟檔案。',
    'antigravity.channel': '此擴充套件組件的發行通道'
};

const OFFICIAL_EDITOR_TRANSLATIONS = {
    'Antigravity Artifact Viewer': 'Antigravity 產出檢視器',
    'Antigravity Settings Viewer': 'Antigravity 設定檢視器'
};

function localizeOfficialExtension(extDir, isRestore = false) {
    console.log(`\n📦 [官方套件] 目標目錄：${extDir}`);
    const pkgPath = path.join(extDir, 'package.json');
    const pkgBakPath = path.join(extDir, 'package.json.bak');
    const extJsPath = path.join(extDir, 'extension.js');
    const extJsBakPath = path.join(extDir, 'extension.js.bak');

    if (isRestore) {
        if (fs.existsSync(pkgBakPath)) {
            fs.copyFileSync(pkgBakPath, pkgPath);
            console.log('  ✅ 已還原 package.json');
        }
        if (fs.existsSync(extJsBakPath)) {
            fs.copyFileSync(extJsBakPath, extJsPath);
            console.log('  ✅ 已還原 extension.js');
        }
        return;
    }

    // 備份 package.json
    if (!fs.existsSync(pkgBakPath)) {
        fs.copyFileSync(pkgPath, pkgBakPath);
        console.log('  📦 已建立 package.json.bak 備份');
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // 翻譯 commands
    if (pkg.contributes && pkg.contributes.commands) {
        for (const cmd of pkg.contributes.commands) {
            if (OFFICIAL_COMMAND_TRANSLATIONS[cmd.title]) {
                cmd.title = OFFICIAL_COMMAND_TRANSLATIONS[cmd.title];
            }
        }
    }

    // 翻譯 customEditors
    if (pkg.contributes && pkg.contributes.customEditors) {
        for (const ed of pkg.contributes.customEditors) {
            if (OFFICIAL_EDITOR_TRANSLATIONS[ed.displayName]) {
                ed.displayName = OFFICIAL_EDITOR_TRANSLATIONS[ed.displayName];
            }
        }
    }

    // 翻譯 configuration
    if (pkg.contributes && pkg.contributes.configuration && pkg.contributes.configuration.properties) {
        const props = pkg.contributes.configuration.properties;
        for (const [key, desc] of Object.entries(OFFICIAL_CONFIG_TRANSLATIONS)) {
            if (props[key]) {
                props[key].description = desc;
            }
        }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t'), 'utf8');
    console.log('  ✅ package.json 指令與設定繁體中文化完成！');

    // 備份與替換 extension.js
    if (fs.existsSync(extJsPath)) {
        if (!fs.existsSync(extJsBakPath)) {
            fs.copyFileSync(extJsPath, extJsBakPath);
            console.log('  📦 已建立 extension.js.bak 備份');
        }

        let code = fs.readFileSync(extJsPath, 'utf8');
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
        console.log('  ✅ extension.js 介面與載入流程繁體中文化完成！');
    }
}

/* ==========================================================
 * 2. Cockpit 擴充套件 (jlcodes.antigravity-cockpit) 字典與中文化
 * ========================================================== */

const COCKPIT_COMMAND_TRANSLATIONS = {
    'Open Antigravity Cockpit': '開啟 Antigravity 儀表板',
    'Refresh Quota Data': '重新整理配額資料',
    'Refresh Available Models Cache': '重新整理可用模型快取',
    'Show Logs': '顯示記錄檔',
    'Retry Connection': '重試連線',
    'Report Issue / Feedback': '回報問題與意見回饋',
    'Set Warning Threshold': '設定警告臨界值',
    'Set Critical Threshold': '設定嚴重警告臨界值',
    'Set Account Switch Mode': '設定帳號切換模式',
    'Refresh Announcements': '重新整理公告資訊',
    'Refresh Account List': '重新整理帳號清單',
    'Switch to This Account': '切換至此帳號',
    'Open Cockpit Tools': '開啟儀表板工具集',
    'Load Account Quota': '載入帳號配額',
    'Debug Local Account (state.vscdb)': '偵錯本機帳號資料庫 (state.vscdb)'
};

const COCKPIT_CONFIG_TRANSLATIONS = {
    'agCockpit.refreshInterval': {
        description: '重新整理配額資料的間隔秒數 (10-3600)。'
    },
    'agCockpit.logLevel': {
        description: '輸出頻道的記錄層級。',
        enumDescriptions: [
            '顯示包含偵錯資訊在內的所有記錄',
            '顯示一般資訊、警告與錯誤',
            '僅顯示警告與錯誤',
            '僅顯示錯誤'
        ]
    },
    'agCockpit.notificationEnabled': {
        description: '當配額耗盡或不足時顯示通知。'
    },
    'agCockpit.statusBarFormat': {
        description: '狀態列顯示格式。',
        enumDescriptions: [
            '僅圖示 - 🚀',
            '僅狀態圓點 - 🟢/🟡/🔴',
            '僅百分比 - 95%',
            '圓點 + 百分比 - 🟢 95%',
            '名稱 + 百分比 - Sonnet: 95%',
            '圓點 + 模型名稱 + 百分比 - 🟢 Sonnet: 95% (預設)'
        ]
    },
    'agCockpit.groupingEnabled': {
        description: '啟用配額群組功能。共用同一配額池的模型將分組顯示。'
    },
    'agCockpit.groupingShowInStatusBar': {
        description: '在狀態列中顯示配額群組，而非個別模型。'
    },
    'agCockpit.warningThreshold': {
        description: '警告臨界值百分比。配額低於此數值將顯示黃色警告 (5-80)。'
    },
    'agCockpit.criticalThreshold': {
        description: '嚴重警告臨界值百分比。配額低於此數值將顯示紅色危急警示 (1-50)。'
    },
    'agCockpit.quotaSource': {
        description: '配額來源。使用已授權帳號無需本機程序即可擷取配額。',
        enumDescriptions: [
            '本機程序',
            '已授權帳號 (預設)'
        ]
    },
    'agCockpit.displayMode': {
        description: '配額資訊顯示模式。若系統不支援 Webview，請改用「quickpick」。',
        enumDescriptions: [
            '完整 Webview 儀表板 (預設)',
            '輕量 QuickPick 選單 (相容性更佳)'
        ]
    },
    'agCockpit.profileHidden': {
        description: '在儀表板中隱藏方案詳細資料面板。'
    },
    'agCockpit.dataMasked': {
        description: '在方案詳細資料面板中遮蔽機密資料（如電子郵件等）。'
    }
};

function localizeCockpitExtension(extDir, isRestore = false) {
    console.log(`\n📦 [Cockpit 儀表板套件] 目標目錄：${extDir}`);
    const pkgPath = path.join(extDir, 'package.json');
    const pkgBakPath = path.join(extDir, 'package.json.bak');

    if (isRestore) {
        if (fs.existsSync(pkgBakPath)) {
            fs.copyFileSync(pkgBakPath, pkgPath);
            console.log('  ✅ 已還原 package.json');
        }
        return;
    }

    // 備份 package.json
    if (!fs.existsSync(pkgBakPath)) {
        fs.copyFileSync(pkgPath, pkgBakPath);
        console.log('  📦 已建立 package.json.bak 備份');
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // 翻譯 description
    pkg.description = 'Antigravity AI 的專屬配額監控儀表板。';

    // 翻譯 commands
    if (pkg.contributes && pkg.contributes.commands) {
        for (const cmd of pkg.contributes.commands) {
            if (COCKPIT_COMMAND_TRANSLATIONS[cmd.title]) {
                cmd.title = COCKPIT_COMMAND_TRANSLATIONS[cmd.title];
            }
        }
    }

    // 翻譯 viewsContainers
    if (pkg.contributes && pkg.contributes.viewsContainers && pkg.contributes.viewsContainers.activitybar) {
        for (const vb of pkg.contributes.viewsContainers.activitybar) {
            if (vb.id === 'agCockpit') {
                vb.title = 'Antigravity 儀表板';
            }
        }
    }

    // 翻譯 views
    if (pkg.contributes && pkg.contributes.views && pkg.contributes.views.agCockpit) {
        for (const view of pkg.contributes.views.agCockpit) {
            if (view.id === 'agCockpit.accountTree') {
                view.name = '帳號';
                view.contextualTitle = 'Antigravity 帳號';
            }
        }
    }

    // 翻譯 configuration
    if (pkg.contributes && pkg.contributes.configuration) {
        pkg.contributes.configuration.title = 'Antigravity 儀表板';
        if (pkg.contributes.configuration.properties) {
            const props = pkg.contributes.configuration.properties;
            for (const [key, item] of Object.entries(COCKPIT_CONFIG_TRANSLATIONS)) {
                if (props[key]) {
                    if (item.description) props[key].description = item.description;
                    if (item.enumDescriptions) props[key].enumDescriptions = item.enumDescriptions;
                }
            }
        }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t'), 'utf8');
    console.log('  ✅ Cockpit 15 個命令、側邊欄與設定繁體中文化完成！');
}

/* ==========================================================
 * 主程式
 * ========================================================== */

function main() {
    const args = process.argv.slice(2);
    const isRestore = args.includes('--restore');

    try {
        const { official, cockpit } = findInstalledExtensions();

        console.log(`==========================================================`);
        console.log(`  VS Code Antigravity 繁體中文化工具 (雙套件支援)`);
        console.log(`==========================================================`);

        if (!official && !cockpit) {
            throw new Error(`未在 ~/.vscode/extensions/ 找到任何 Antigravity 相關擴充套件`);
        }

        if (official) {
            localizeOfficialExtension(official, isRestore);
        } else {
            console.log(`\nℹ️ 未偵測到官方 Antigravity 擴充套件 (google.google-antigravity)`);
        }

        if (cockpit) {
            localizeCockpitExtension(cockpit, isRestore);
        } else {
            console.log(`\nℹ️ 未偵測到 Antigravity Cockpit 擴充套件 (jlcodes.antigravity-cockpit)`);
        }

        console.log(`\n==========================================================`);
        if (isRestore) {
            console.log(`🎉 擴充套件已成功還原為官方英文原版！請重啟 VS Code。`);
        } else {
            console.log(`🎉 恭喜！VS Code 相關擴充套件繁體中文化已完成。請重啟 VS Code！`);
        }
        console.log(`==========================================================`);
    } catch (err) {
        console.error(`❌ 執行失敗：`, err.message);
        process.exit(1);
    }
}

main();
