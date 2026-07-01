import { contextBridge } from 'electron';

// Безопасный bridge между renderer и main.
// Сейчас не требуется дополнительных API, но структура готова для Steamworks и т.п.
contextBridge.exposeInMainWorld('electronAPI', {});
