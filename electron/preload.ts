import { contextBridge, ipcRenderer } from 'electron';

export interface SteamStatus {
  isRunning: boolean;
  steamId: string | null;
  steamName: string | null;
}

const steamAPI = {
  getStatus: (): Promise<SteamStatus> => ipcRenderer.invoke('steam:get-status'),
  activateAchievement: (name: string): Promise<boolean> =>
    ipcRenderer.invoke('steam:activate-achievement', name),
  isAchievementActivated: (name: string): Promise<boolean> =>
    ipcRenderer.invoke('steam:is-achievement-activated', name),
  openOverlay: (url: string): Promise<boolean> =>
    ipcRenderer.invoke('steam:open-overlay', url),
  openOverlayToStore: (appId: number): Promise<boolean> =>
    ipcRenderer.invoke('steam:open-overlay-store', appId),
};

contextBridge.exposeInMainWorld('electronAPI', {
  steam: steamAPI,
});

// Расширяем глобальный Window для TypeScript в renderer-процессе.
declare global {
  interface Window {
    electronAPI?: {
      steam?: typeof steamAPI;
    };
  }
}
