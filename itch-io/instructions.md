# Публикация на itch.io

## 1. Регистрация и создание проекта

1. Зарегистрируйся или войди на [itch.io](https://itch.io/).
2. Нажми **"Create new project"** (https://itch.io/game/new).
3. Заполни основные поля:
   - **Title:** Nemesis
   - **Project URL:** `nemesis` (итоговый адрес будет `https://yourname.itch.io/nemesis`)
   - **Classification:** Games
   - **Kind of project:** Game
   - **Release status:** Released или In development
   - **Pricing:** Free (или укажи цену/донат)
4. В поле **Description** скопируй содержимое `page-description.html`.
5. Загрузи обложку (Cover image) — рекомендуется 630×500 px. Можно использовать `electron/icon.png`.
6. Сохрани черновик (**Save**).

## 2. API-ключ для Butler

1. Перейди в настройки профиля: https://itch.io/user/settings/api-keys
2. Создай новый ключ (**Generate new API key**).
3. Скопируй ключ — он понадобится для загрузки билдов.

## 3. Загрузка билдов через скрипт

В корне `nemesis-steam/` выполни:

```bash
set ITCH_USER=your_itch_username
set ITCH_GAME=nemesis
set BUTLER_API_KEY=your_api_key
npm run itch:push
```

Скрипт автоматически:
- скачает Butler, если его нет;
- соберёт веб-версию и упакует её в zip;
- проверит наличие десктопных билдов и соберёт их при необходимости;
- загрузит 4 канала:
  - `win` — установщик `Nemesis-0.1.0-x64.exe`
  - `win-portable` — portable `Nemesis-0.1.0-portable.exe`
  - `linux` — `Nemesis-0.1.0-x64.AppImage`
  - `web` — HTML5-версия для запуска в браузере

## 4. Настройка каналов на itch.io

После загрузки зайди в редактирование проекта, раздел **"Uploads"**:
- Для канала `web` выбери **"This file will be played in the browser"**.
- Убедись, что порядок отображения удобный (например, web первым).
- Укажи совместимые платформы для каждого файла.

## 5. Публикация

1. Проверь страницу через **"View page"**.
2. Если всё ок, нажми **"Publish"**.
3. Готово — игра доступна по адресу `https://yourname.itch.io/nemesis`.

## Полезные ссылки

- [Butler documentation](https://itch.io/docs/butler/)
- [itch.io project editing guide](https://itch.io/docs/creators/getting-started)
