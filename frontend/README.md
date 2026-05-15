# Frontend

Frontend написан на React + Vite.

## Страницы

- `/` - главная страница.
- `/register` - регистрация сотрудника.
- `/login` - вход сотрудника.
- `/work` - рабочий день сотрудника.
- `/admin` - вход администратора.
- `/admin/dashboard` - админ-панель.

## Локальный запуск через Docker

```bash
docker compose up --build
```

Frontend будет доступен на:

```text
http://127.0.0.1:5173/
```

## Production-сборка через Docker

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Сайт будет доступен на:

```text
http://127.0.0.1/
```

## Локальный запуск без Docker

Требуется Node.js 20+ и npm.

```bash
cd frontend
npm i
npm run dev
```

API проксируется на backend.
