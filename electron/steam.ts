import steamworks from 'steamworks.js';

export interface SteamStatus {
  isRunning: boolean;
  steamId: string | null;
  steamName: string | null;
}

let client: ReturnType<typeof steamworks.init> | null = null;

export function initSteam(appId: number): boolean {
  try {
    client = steamworks.init(appId);

    // Включаем Steam overlay для Electron.
    steamworks.electronEnableSteamOverlay(true);

    const steamId = client.localplayer.getSteamId()?.steamId64?.toString() ?? null;
    const steamName = client.localplayer.getName() ?? null;
    console.log('[STEAM] Initialized for app', appId, '| user:', steamName, steamId);
    return true;
  } catch (err) {
    console.warn('[STEAM] Failed to initialize:', err);
    client = null;
    return false;
  }
}

export function getSteamStatus(): SteamStatus {
  if (!client) {
    return { isRunning: false, steamId: null, steamName: null };
  }
  try {
    return {
      isRunning: true,
      steamId: client.localplayer.getSteamId()?.steamId64?.toString() ?? null,
      steamName: client.localplayer.getName() ?? null,
    };
  } catch {
    return { isRunning: false, steamId: null, steamName: null };
  }
}

export function activateSteamAchievement(name: string): boolean {
  if (!client) return false;
  try {
    return client.achievement.activate(name);
  } catch (err) {
    console.warn('[STEAM] activateAchievement error:', err);
    return false;
  }
}

export function isSteamAchievementActivated(name: string): boolean {
  if (!client) return false;
  try {
    return client.achievement.isActivated(name);
  } catch (err) {
    console.warn('[STEAM] isActivated error:', err);
    return false;
  }
}

export function openSteamOverlay(url: string): boolean {
  if (!client) return false;
  try {
    client.overlay.activateToWebPage(url);
    return true;
  } catch (err) {
    console.warn('[STEAM] openOverlay error:', err);
    return false;
  }
}

export function openSteamOverlayToStore(appId: number): boolean {
  if (!client) return false;
  try {
    client.overlay.activateToStore(appId, 0);
    return true;
  } catch (err) {
    console.warn('[STEAM] activateToStore error:', err);
    return false;
  }
}
