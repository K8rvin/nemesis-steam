# Nemesis — Desktop Client for itch.io

Десктопная Electron-обёртка для веб-клиента [nemesis-web](../nemesis-web), предназначенная для публикации на itch.io.

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

## Публикация на itch.io

Проект настроен для бесплатной публикации на [itch.io](https://itch.io/) без взносов.

### Быстрый старт

1. Создай проект на https://itch.io/game/new (название `Nemesis`, URL `nemesis`).
2. Скопируй описание из `itch-io/page-description.html` в поле **Description**.
3. Получи API-ключ: https://itch.io/user/settings/api-keys
4. Запусти загрузку билдов:

```bash
set ITCH_USER=your_itch_username
set ITCH_GAME=nemesis
set BUTLER_API_KEY=your_api_key
npm run itch:push
```

Скрипт `itch-push.js` автоматически скачает Butler, соберёт веб-версию, упакует её в zip и загрузит 4 канала:

- `win` — установщик `Nemesis-0.1.0-x64.exe`
- `win-portable` — portable `Nemesis-0.1.0-portable.exe`
- `linux` — `Nemesis-0.1.0-x64.AppImage`
- `web` — HTML5-версия для браузера

Подробная инструкция — в `itch-io/instructions.md`.
