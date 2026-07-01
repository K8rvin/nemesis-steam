: [p## Nemesis — Steam Electron Client

Десктопная Electron-обёртка для веб-клиента [nemesis-web](../nemesis-web), предназначенная для публикации в Steam.

## Требования

- Node.js 18+
- npm
- Собранный `nemesis-web` (скрипт `build` делает это автоматически)

## Установка зависимостей

```bash
cd nemesis-steam
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

Скрипт соберёт `nemesis-web`, скопирует артефакты в `app/` и запустит Electron.

## Сборка установщиков

```bash
npm run dist
```

Результат появится в `dist/`:

- Windows: `Nemesis-X.X.X-x64.exe` (установщик NSIS) и `Nemesis-X.X.X-portable.exe`.
- Linux: `Nemesis-X.X.X-x64.AppImage`.

## Структура

```
nemesis-steam/
├── electron/
│   ├── main.ts      # точка входа Electron
│   ├── preload.ts   # безопасный bridge renderer ↔ main
│   └── icon.png     # иконка приложения
├── scripts/
│   └── build.js     # сборка веб-клиента + Electron + упаковка
├── app/             # копия собранного nemesis-web/dist (не коммитится)
├── dist-electron/   # скомпилированный main/preload (не коммитится)
└── dist/            # готовые установщики (не коммитится)
```

## Примечания

- Игра остаётся онлайн: используется тот же бэкенд `nemesis-backend` и Supabase.
- Steamworks SDK не подключён в этой версии; интеграцию (достижения Steam, overlay) можно добавить позже через `steamworks.js`/`greenworks`.
- Для Steam рекомендуется получить `appid` и настроить `electron-builder` подписывать исполняемые файлы.
