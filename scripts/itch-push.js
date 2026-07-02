import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const itchDir = path.join(distDir, 'itch');
const butlerCache = path.join(root, 'node_modules', '.cache', 'butler');

const version = process.env.npm_package_version || '0.1.0';
const user = process.env.ITCH_USER;
const game = process.env.ITCH_GAME;
const apiKey = process.env.BUTLER_API_KEY;
const butlerPathEnv = process.env.BUTLER_PATH;

function ensureEnv() {
  const missing = [];
  if (!user) missing.push('ITCH_USER');
  if (!game) missing.push('ITCH_GAME');
  if (!apiKey) missing.push('BUTLER_API_KEY');
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('   Set them before running the script, for example:');
    console.error('   set ITCH_USER=yourname');
    console.error('   set ITCH_GAME=nemesis');
    console.error('   set BUTLER_API_KEY=your_api_key');
    process.exit(1);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { followRedirect: true }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Download failed: ${response.statusCode} ${url}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', reject);
  });
}

async function ensureButler() {
  if (butlerPathEnv) return butlerPathEnv;

  const platform = process.platform === 'win32' ? 'windows-amd64' : process.platform === 'darwin' ? 'darwin-amd64' : 'linux-amd64';
  const exeName = process.platform === 'win32' ? 'butler.exe' : 'butler';
  const exePath = path.join(butlerCache, exeName);

  if (await fs.pathExists(exePath)) {
    return exePath;
  }

  console.log('📥 Downloading Butler...');
  await fs.ensureDir(butlerCache);
  const zipPath = path.join(butlerCache, 'butler.zip');
  const url = `https://broth.itch.ovh/butler/${platform}/LATEST/archive/default`;
  await downloadFile(url, zipPath);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(butlerCache, true);

  if (process.platform !== 'win32') {
    fs.chmodSync(exePath, 0o755);
  }

  console.log('✅ Butler ready:', exePath);
  return exePath;
}

function runButler(butler, args) {
  const result = spawnSync(butler, args, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      BUTLER_API_KEY: apiKey,
    },
  });
  if (result.status !== 0) {
    throw new Error(`Butler failed with code ${result.status}`);
  }
}

async function ensureBuilds() {
  const required = [
    path.join(distDir, 'Nemesis-0.1.0-x64.exe'),
    path.join(distDir, 'Nemesis-0.1.0-portable.exe'),
    path.join(distDir, 'Nemesis-0.1.0-x64.AppImage'),
  ];
  const missing = required.filter((f) => !fs.existsSync(f));
  if (missing.length > 0) {
    console.log('🔧 Desktop builds not found, running npm run dist...');
    const result = spawnSync('npm', ['run', 'dist'], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error('Build failed');
    }
  }

  // Собираем zip для веб-версии (HTML5).
  const webDist = path.resolve(root, '..', 'nemesis-web', 'dist');
  if (!fs.existsSync(webDist)) {
    console.log('🔧 Web build not found, running npm run build in nemesis-web...');
    const result = spawnSync('npm', ['run', 'build'], { cwd: path.resolve(root, '..', 'nemesis-web'), stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error('Web build failed');
    }
  }

  await fs.ensureDir(itchDir);
  const webZip = path.join(itchDir, 'nemesis-web.zip');
  const zip = new AdmZip();
  zip.addLocalFolder(webDist, '');
  zip.writeZip(webZip);
  console.log('📦 Web build zipped:', webZip);
}

async function main() {
  try {
    ensureEnv();
    await ensureBuilds();
    const butler = await ensureButler();

    const target = `${user}/${game}`;
    const pushes = [
      { file: path.join(distDir, 'Nemesis-0.1.0-x64.exe'), channel: 'win' },
      { file: path.join(distDir, 'Nemesis-0.1.0-portable.exe'), channel: 'win-portable' },
      { file: path.join(distDir, 'Nemesis-0.1.0-x64.AppImage'), channel: 'linux' },
      { file: path.join(itchDir, 'nemesis-web.zip'), channel: 'web' },
    ];

    for (const { file, channel } of pushes) {
      if (!fs.existsSync(file)) {
        console.warn(`⚠️ Skipping ${channel}: file not found ${file}`);
        continue;
      }
      console.log(`\n🚀 Pushing ${channel}...`);
      runButler(butler, ['push', file, `${target}:${channel}`, '--userversion', version]);
    }

    console.log('\n✅ All done! Check your page at https://' + user + '.itch.io/' + game);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

main();
