const fs = require('fs');
const path = require('path');

const WINDOWS_EXECUTABLES = ['Antigravity.exe', 'Antigravity IDE.exe'];

function getDefaultWindowsCandidates(env = process.env, options = {}) {
    const driveLetters = options.driveLetters ?? ['C', 'D', 'E', 'F'];
    const registryCandidates = options.registryCandidates ?? [];
    const candidates = [env.ANTIGRAVITY_INSTALL_DIR, env.ANTIGRAVITY_HOME];

    if (env.LOCALAPPDATA) {
        candidates.push(
            path.join(env.LOCALAPPDATA, 'Programs', 'antigravity'),
            path.join(env.LOCALAPPDATA, 'Programs', 'Antigravity IDE'),
        );
    }

    if (env.ProgramFiles) {
        candidates.push(
            path.join(env.ProgramFiles, 'Antigravity'),
            path.join(env.ProgramFiles, 'Antigravity IDE'),
        );
    } else {
        candidates.push('C:\\Program Files\\Antigravity', 'C:\\Program Files\\Antigravity IDE');
    }

    candidates.push(...registryCandidates);
    for (const drive of driveLetters) {
        candidates.push(
            `${drive}:\\Programs\\Antigravity`,
            `${drive}:\\Programs\\Antigravity IDE`,
            `${drive}:\\Antigravity`,
            `${drive}:\\Antigravity IDE`,
        );
    }

    return candidates.filter(Boolean);
}

function resolveInstallDir(candidate) {
    if (!candidate) return null;
    const resolved = path.resolve(candidate);
    try {
        if (fs.statSync(resolved).isFile() && resolved.toLowerCase().endsWith('app.asar')) {
            return path.dirname(resolved);
        }
    } catch (e) {
        return resolved;
    }
    return resolved;
}

function describeInstallation(candidate) {
    const installDir = resolveInstallDir(candidate);
    if (!installDir || !fs.existsSync(installDir)) return null;

    const asarPaths = [
        path.join(installDir, 'resources', 'app.asar'),
        path.join(installDir, 'app.asar'),
        path.join(installDir, 'Contents', 'Resources', 'app.asar'),
    ];
    const legacyPaths = [
        path.join(installDir, 'resources', 'app', 'product.json'),
        path.join(installDir, 'Contents', 'Resources', 'app', 'product.json'),
    ];
    const architecture = asarPaths.some(p => fs.existsSync(p))
        ? 'asar'
        : legacyPaths.some(p => fs.existsSync(p))
            ? 'legacy'
            : null;
    if (!architecture) return null;

    const executableName = WINDOWS_EXECUTABLES.find(name =>
        fs.existsSync(path.join(installDir, name)),
    ) || null;

    return { installDir, executableName, architecture };
}

function discoverInstallations(candidates) {
    const seen = new Set();
    const installations = [];

    for (const candidate of candidates) {
        const installDir = resolveInstallDir(candidate);
        if (!installDir) continue;
        const key = installDir.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const installation = describeInstallation(installDir);
        if (installation) installations.push(installation);
    }

    return installations;
}

function buildWindowsWatcherTargets(installations, env = process.env) {
    return installations.map(installation => {
        const { installDir, executableName, architecture } = installation;
        const appSupportName = executableName === 'Antigravity IDE.exe'
            ? 'Antigravity IDE'
            : 'Antigravity';
        const appSupport = env.APPDATA ? path.join(env.APPDATA, appSupportName) : null;

        if (architecture === 'asar') {
            const asarPath = [
                path.join(installDir, 'resources', 'app.asar'),
                path.join(installDir, 'app.asar'),
                path.join(installDir, 'Contents', 'Resources', 'app.asar'),
            ].find(candidate => fs.existsSync(candidate));
            return { ...installation, appPath: installDir, appSupport, asarPath };
        }

        const resourcesBase = fs.existsSync(path.join(installDir, 'Contents', 'Resources', 'app'))
            ? path.join(installDir, 'Contents', 'Resources')
            : path.join(installDir, 'resources');
        const appOut = path.join(resourcesBase, 'app', 'out');
        return {
            ...installation,
            appPath: installDir,
            appSupport,
            markerPath: path.join(appOut, 'ag_agent_hanhua.js'),
            htmlPaths: [
                path.join(appOut, 'vs', 'code', 'electron-browser', 'workbench', 'workbench-jetski-agent.html'),
                path.join(appOut, 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
            ],
        };
    });
}

function isWatcherTargetLocalized(target) {
    const needle = Buffer.from('命令選擇區', 'utf8');
    if (target.architecture === 'asar') {
        if (!target.asarPath || !fs.existsSync(target.asarPath)) return false;
        return fs.readFileSync(target.asarPath).indexOf(needle) !== -1;
    }

    if (!target.markerPath || !fs.existsSync(target.markerPath)) return false;
    if (fs.readFileSync(target.markerPath).indexOf(needle) === -1) return false;
    const existingHtml = (target.htmlPaths || []).filter(candidate => fs.existsSync(candidate));
    return existingHtml.length > 0 && existingHtml.every(candidate =>
        fs.readFileSync(candidate, 'utf8').includes('ag_agent_hanhua.js'),
    );
}

module.exports = {
    WINDOWS_EXECUTABLES,
    buildWindowsWatcherTargets,
    describeInstallation,
    discoverInstallations,
    getDefaultWindowsCandidates,
    isWatcherTargetLocalized,
};
