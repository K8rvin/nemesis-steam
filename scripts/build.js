import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const webDir = path.resolve(root, '../nemesis-web');
const appDir = path.join(root, 'app');
const distElectronDir = path.join(root, 'dist-electron');

const isDev = process.argv.includes('--dev');
const isDist = process.argv.includes('--dist');

async function buildWeb() {
  console.log('🔧 Building web client...');
  execSync('npm run build', { cwd: webDir, stdio: 'inherit' });
}

async function prepareApp() {
  console.log('📦 Preparing app directory...');
  await fs.remove(appDir);
  await fs.copy(path.join(webDir, 'dist'), appDir);
}

async function compileElectron() {
  console.log('⚙️ Compiling Electron main...');
  await fs.remove(distElectronDir);
  execSync('npx tsc -p tsconfig.json', { cwd: root, stdio: 'inherit' });
}

async function packageApp() {
  if (isDev) {
    console.log('🚀 Starting Electron in dev mode...');
    execSync('npx electron .', { cwd: root, stdio: 'inherit' });
    return;
  }

  console.log('🚚 Packaging with electron-builder...');
  const args = isDist ? ['--publish=never'] : ['--dir', '--publish=never'];
  execSync(`npx electron-builder --config electron-builder.json ${args.join(' ')}`, {
    cwd: root,
    stdio: 'inherit',
  });
}

async function main() {
  try {
    await buildWeb();
    await prepareApp();
    await compileElectron();
    await packageApp();
    console.log('✅ Done');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

main();
