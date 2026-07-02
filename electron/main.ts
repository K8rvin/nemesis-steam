import { app, BrowserWindow, shell, Menu, protocol, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initSteam,
  getSteamStatus,
  activateSteamAchievement,
  isSteamAchievementActivated,
  openSteamOverlay,
  openSteamOverlayToStore,
} from './steam.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_SCHEME = 'app';
const APP_ROOT = path.resolve(__dirname, '../app');

function getAssetPath(requestUrl: string): string {
  const url = new URL(requestUrl);
  let pathname = decodeURIComponent(url.pathname);
  if (!pathname || pathname === '/') {
    pathname = '/index.html';
  }
  const target = path.resolve(APP_ROOT, pathname.replace(/^\/+/, ''));
  // Защита от выхода за пределы папки приложения.
  if (!target.startsWith(APP_ROOT + path.sep) && target !== APP_ROOT) {
    return path.join(APP_ROOT, 'index.html');
  }
  return target;
}

// Регистрируем кастомный протокол до готовности приложения.
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: false,
    },
  },
]);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 640,
    title: 'Nemesis',
    icon: path.join(__dirname, '../electron/icon.png'),
    backgroundColor: '#0A0B0E',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Загружаем приложение через кастомный протокол, чтобы абсолютные пути
  // /images/... и /audio/... корректно разрешались относительно папки app.
  mainWindow.loadURL(`${APP_SCHEME}:///index.html`);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Открываем внешние ссылки в системном браузере, а не внутри приложения.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpc(): void {
  ipcMain.handle('steam:get-status', () => getSteamStatus());
  ipcMain.handle('steam:activate-achievement', (_event, name: string) =>
    activateSteamAchievement(name)
  );
  ipcMain.handle('steam:is-achievement-activated', (_event, name: string) =>
    isSteamAchievementActivated(name)
  );
  ipcMain.handle('steam:open-overlay', (_event, url: string) =>
    openSteamOverlay(url)
  );
  ipcMain.handle('steam:open-overlay-store', (_event, appId: number) =>
    openSteamOverlayToStore(appId)
  );
}

app.whenReady().then(() => {
  protocol.registerFileProtocol(APP_SCHEME, (request, callback) => {
    callback({ path: getAssetPath(request.url) });
  });

  Menu.setApplicationMenu(null);
  setupIpc();

  // Инициализируем Steamworks. Без appid используется тестовый 480.
  // Если Steam не запущен или DLL отсутствует — приложение продолжит работу.
  const appId = process.env.STEAM_APP_ID ? parseInt(process.env.STEAM_APP_ID, 10) : 480;
  initSteam(appId);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
