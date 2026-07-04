import { contextBridge } from 'electron';

// Безопасный bridge между renderer и main.
// Сейчас дополнительные API не требуются, но структура оставлена для будущих расширений.
contextBridge.exposeInMainWorld('electronAPI', {});
