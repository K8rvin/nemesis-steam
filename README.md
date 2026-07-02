# Nemesis — Steam Electron Client

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
│   ├── steam.ts     # обёртка над Steamworks
│   └── icon.png     # иконка приложения
├── scripts/
│   └── build.js     # сборка веб-клиента + Electron + упаковка
├── app/             # копия собранного nemesis-web/dist (не коммитится)
├── dist-electron/   # скомпилированный main/preload (не коммитится)
└── dist/            # готовые установщики (не коммитится)
```

## Steamworks

В проект добавлена обёртка [`steamworks.js`](https://github.com/ceifa/steamworks.js) с базовой интеграцией:

- инициализация Steam client;
- получение Steam ID и имени пользователя;
- активация достижений Steam;
- открытие Steam Overlay (веб-страница / магазин);
- overlay уже включён через `electronEnableSteamOverlay`.

### Как запустить с настоящим appid

1. Получи `appid` в Steam Partner Dashboard.
2. Помести `steam_api64.dll` (из Steamworks SDK) в корень `nemesis-steam/`.
3. Создай файл `steam_appid.txt` с числовым appid рядом с `steam_api64.dll`.
4. Перед сборкой укажи appid:
   ```bash
   set STEAM_APP_ID=123456   # Windows
   npm run dist
   ```
   Или задай `STEAM_APP_ID` в CI/GitHub Actions.

### Тестовый режим

Если `STEAM_APP_ID` не задан, используется тестовый appid `480` (SpaceWar). Для его работы нужен запущенный Steam клиент и `steam_api64.dll`. Без Steam приложение продолжит работу, а в консоли будет предупреждение.

### Использование в веб-клиенте

В renderer-процессе доступен объект:

```ts
window.electronAPI?.steam?.getStatus()
window.electronAPI?.steam?.activateAchievement('ACHIEVEMENT_NAME')
window.electronAPI?.steam?.openOverlay('https://example.com')
```

Эти вызовы безопасны: если приложение запущено не в Electron, `window.electronAPI` будет `undefined`.

## Примечания

- Игра остаётся онлайн: используется тот же бэкенд `nemesis-backend` и Supabase.
- Для Steam рекомендуется подписывать исполняемые файлы (code signing).
- Первый запуск скачанного `.exe` может предупреждать Windows SmartScreen из-за отсутствия подписи.
