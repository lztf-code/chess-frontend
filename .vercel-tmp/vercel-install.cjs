#!/usr/bin/env node
const { spawnSync } = require('child_process');
const os = require('os');
const isWindows = os.platform() === 'win32';
const ALLOWED_COMMANDS = new Set(['node', 'npm', 'pnpm', 'yarn', 'vercel']);
function log(msg) { console.error(msg); }
function commandExists(cmd) {
  if (!ALLOWED_COMMANDS.has(cmd)) throw new Error(`Command not in whitelist: ${cmd}`);
  try {
    if (isWindows) { const result = spawnSync('where', [cmd], { stdio: 'ignore' }); return result.status === 0; }
    else { const result = spawnSync('sh', ['-c', `command -v "$1"`, '--', cmd], { stdio: 'ignore' }); return result.status === 0; }
  } catch { return false; }
}
function getCommandOutput(cmd, args) {
  try { const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], shell: isWindows }); return result.status === 0 ? (result.stdout || '').trim() : null; } catch { return null; }
}
function detectPackageManager() {
  if (commandExists('pnpm')) return 'pnpm';
  if (commandExists('yarn')) return 'yarn';
  if (commandExists('npm')) return 'npm';
  return null;
}
function main() {
  log('Checking Vercel CLI...');
  if (commandExists('vercel')) {
    const version = getCommandOutput('vercel', ['--version']) || 'unknown';
    log(`Vercel CLI already installed: ${version}`);
    console.log(JSON.stringify({ status: 'already_installed' }));
    process.exit(0);
  }
  const pkgManager = detectPackageManager();
  if (!pkgManager) { log('No package manager found'); process.exit(1); }
  log(`Installing Vercel CLI with ${pkgManager}...`);
  const commands = {
    pnpm: ['pnpm', ['add', '-g', 'vercel']],
    yarn: ['yarn', ['global', 'add', 'vercel']],
    npm: ['npm', ['install', '-g', 'vercel']]
  };
  const entry = commands[pkgManager];
  try {
    const result = spawnSync(entry[0], entry[1], { stdio: 'inherit', shell: isWindows });
    if (result.status !== 0) throw new Error(`Exit code: ${result.status}`);
  } catch (error) {
    log(`Installation failed: ${error.message}`);
    process.exit(1);
  }
  if (commandExists('vercel')) {
    log('Vercel CLI installed successfully!');
    console.log(JSON.stringify({ status: 'success' }));
  } else {
    log('Installation may have failed - vercel command not found');
    process.exit(1);
  }
}
main();
