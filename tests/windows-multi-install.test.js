const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
    buildWindowsWatcherTargets,
    discoverInstallations,
    getDefaultWindowsCandidates,
    isWatcherTargetLocalized,
} = require('../windows_installations');

test('discovers Antigravity and Antigravity IDE as separate installations', (t) => {
    const localAppData = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-discovery-'));
    t.after(() => fs.rmSync(localAppData, { recursive: true, force: true }));

    const desktopDir = path.join(localAppData, 'Programs', 'antigravity');
    fs.mkdirSync(path.join(desktopDir, 'resources'), { recursive: true });
    fs.writeFileSync(path.join(desktopDir, 'resources', 'app.asar'), 'fixture');
    fs.writeFileSync(path.join(desktopDir, 'Antigravity.exe'), 'fixture');

    const ideDir = path.join(localAppData, 'Programs', 'Antigravity IDE');
    fs.mkdirSync(path.join(ideDir, 'resources', 'app'), { recursive: true });
    fs.writeFileSync(path.join(ideDir, 'resources', 'app', 'product.json'), '{}');
    fs.writeFileSync(path.join(ideDir, 'Antigravity IDE.exe'), 'fixture');

    const candidates = getDefaultWindowsCandidates(
        { LOCALAPPDATA: localAppData },
        { driveLetters: [] },
    );
    const installations = discoverInstallations(candidates);

    assert.deepEqual(
        installations.map(({ installDir, executableName, architecture }) => ({
            installDir,
            executableName,
            architecture,
        })),
        [
            {
                installDir: path.resolve(desktopDir),
                executableName: 'Antigravity.exe',
                architecture: 'asar',
            },
            {
                installDir: path.resolve(ideDir),
                executableName: 'Antigravity IDE.exe',
                architecture: 'legacy',
            },
        ],
    );
});

test('deduplicates paths case-insensitively without dropping the IDE install', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-dedupe-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const ideDir = path.join(root, 'Antigravity IDE');
    fs.mkdirSync(path.join(ideDir, 'resources', 'app'), { recursive: true });
    fs.writeFileSync(path.join(ideDir, 'resources', 'app', 'product.json'), '{}');
    fs.writeFileSync(path.join(ideDir, 'Antigravity IDE.exe'), 'fixture');

    const installations = discoverInstallations([ideDir, ideDir.toUpperCase()]);

    assert.equal(installations.length, 1);
    assert.equal(installations[0].executableName, 'Antigravity IDE.exe');
});

test('localization engine processes every explicitly selected legacy installation', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-engine-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const installDirs = ['Antigravity', 'Antigravity IDE'].map(name => {
        const installDir = path.join(root, name);
        const appDir = path.join(installDir, 'resources', 'app');
        const workbenchDir = path.join(
            appDir,
            'out', 'vs', 'code', 'electron-browser', 'workbench',
        );
        fs.mkdirSync(workbenchDir, { recursive: true });
        fs.writeFileSync(path.join(appDir, 'product.json'), JSON.stringify({ checksums: {} }));
        fs.writeFileSync(path.join(workbenchDir, 'workbench.html'), '<body>fixture</body>');
        fs.writeFileSync(path.join(workbenchDir, 'workbench-jetski-agent.html'), '<body>fixture</body>');
        return installDir;
    });

    const result = spawnSync(
        process.execPath,
        [
            path.join(__dirname, '..', 'localization_engine.js'),
            '--tw',
            '--no-kill',
            '--install-dir', installDirs[0],
            '--install-dir', installDirs[1],
        ],
        { encoding: 'utf8' },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    for (const installDir of installDirs) {
        const appDir = path.join(installDir, 'resources', 'app');
        const html = fs.readFileSync(
            path.join(appDir, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
            'utf8',
        );
        assert.match(html, /ag_agent_hanhua\.js/);
        assert.equal(fs.existsSync(path.join(appDir, 'out', 'ag_agent_hanhua.js')), true);
    }
});

test('builds separate watcher targets and recognizes a localized IDE install', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-watcher-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const desktopDir = path.join(root, 'Programs', 'antigravity');
    fs.mkdirSync(path.join(desktopDir, 'resources'), { recursive: true });
    fs.writeFileSync(path.join(desktopDir, 'resources', 'app.asar'), '命令選擇區');

    const ideDir = path.join(root, 'Programs', 'Antigravity IDE');
    const ideOut = path.join(ideDir, 'resources', 'app', 'out');
    const workbenchDir = path.join(ideOut, 'vs', 'code', 'electron-browser', 'workbench');
    fs.mkdirSync(workbenchDir, { recursive: true });
    fs.writeFileSync(path.join(ideDir, 'resources', 'app', 'product.json'), '{}');
    fs.writeFileSync(path.join(ideOut, 'ag_agent_hanhua.js'), '命令選擇區');
    fs.writeFileSync(
        path.join(workbenchDir, 'workbench.html'),
        '<body><script src="../../../../ag_agent_hanhua.js"></script></body>',
    );

    const installations = discoverInstallations([desktopDir, ideDir]);
    const targets = buildWindowsWatcherTargets(installations, { APPDATA: path.join(root, 'AppData') });

    assert.deepEqual(targets.map(target => target.architecture), ['asar', 'legacy']);
    assert.equal(isWatcherTargetLocalized(targets[0]), true);
    assert.equal(isWatcherTargetLocalized(targets[1]), true);
    assert.equal(targets[1].appPath, path.resolve(ideDir));
});

test('background watcher localizes an installed Antigravity IDE independently', (t) => {
    const localAppData = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-watcher-run-'));
    t.after(() => fs.rmSync(localAppData, { recursive: true, force: true }));

    const desktopDir = path.join(localAppData, 'Programs', 'antigravity');
    fs.mkdirSync(path.join(desktopDir, 'resources'), { recursive: true });
    fs.writeFileSync(path.join(desktopDir, 'resources', 'app.asar'), '命令選擇區');
    fs.writeFileSync(path.join(desktopDir, 'Antigravity.exe'), 'fixture');

    const ideDir = path.join(localAppData, 'Programs', 'Antigravity IDE');
    const appDir = path.join(ideDir, 'resources', 'app');
    const workbenchDir = path.join(appDir, 'out', 'vs', 'code', 'electron-browser', 'workbench');
    fs.mkdirSync(workbenchDir, { recursive: true });
    fs.writeFileSync(path.join(appDir, 'product.json'), JSON.stringify({ checksums: {} }));
    fs.writeFileSync(path.join(workbenchDir, 'workbench.html'), '<body>fixture</body>');
    fs.writeFileSync(path.join(workbenchDir, 'workbench-jetski-agent.html'), '<body>fixture</body>');
    fs.writeFileSync(path.join(ideDir, 'Antigravity IDE.exe'), 'fixture');

    const watcherPath = process.env.WATCHER_UNDER_TEST || path.join(__dirname, '..', 'auto_localize_watcher.js');
    const result = spawnSync(
        process.execPath,
        [watcherPath],
        {
            encoding: 'utf8',
            env: {
                ...process.env,
                LOCALAPPDATA: localAppData,
                APPDATA: path.join(localAppData, 'AppData'),
                ProgramFiles: path.join(localAppData, 'Program Files'),
                ANTIGRAVITY_INSTALL_DIR: '',
                ANTIGRAVITY_HOME: '',
            },
        },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(fs.existsSync(path.join(appDir, 'out', 'ag_agent_hanhua.js')), true);
    assert.match(
        fs.readFileSync(path.join(workbenchDir, 'workbench.html'), 'utf8'),
        /ag_agent_hanhua\.js/,
    );
});
