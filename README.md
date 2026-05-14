# Time Tracker (FastAPI + React)

ТЗ: Табель учета рабочего времени с логином/регистрацией, фронт на React, бэкенд на FastAPI, деплой в Docker.

## Структура

- backend/ (FastAPI, SQLModel, JWT)
- frontend/ (React + Vite + React Query)
- docker-compose.yml (postgres, backend, frontend)
- docker-compose.prod.yml (production-сборка для сервера)
- DEPLOY.md (простая инструкция ручного деплоя)

## Локальный запуск

1) Backend

```
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --app-dir backend
```

2) Frontend

```
cd frontend
npm i
npm run dev
```

## Docker для разработки

```
docker compose up --build
```

## Простой деплой на сервер

Первый рабочий вариант деплоя описан в `DEPLOY.md`.

Коротко:

```
cp .env.example .env
nano .env
docker compose -f docker-compose.prod.yml up -d --build
```

После запуска:

```
curl http://SERVER_IP/health
```

## Публикация в GitHub

1) Создайте пустой публичный репозиторий на GitHub

2) В папке проекта выполните:

```
git init
git branch -m main
git remote add origin https://github.com/<your-username>/<repo>.git
git add .
git commit -m "feat: time tracker skeleton"
git push -u origin main
```
