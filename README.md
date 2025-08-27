Time Tracker (FastAPI + React)

ТЗ: Табель учета рабочего времени с логином/регистрацией, фронт на React, бэкенд на FastAPI, деплой в Docker.

Структура:
- backend/ (FastAPI, SQLModel, JWT)
- frontend/ (React + Vite + React Query)
- docker-compose.yml (postgres, backend, frontend)

Локальный запуск:
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

Docker
```
docker compose up --build
```

Публикация в GitHub
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

Деплой на сервер (пример):
- Установите Docker и docker compose
- Скопируйте проект на сервер
- Настройте .env или переменные окружения: `DATABASE_URL`, `SECRET_KEY`
- Запустите: `docker compose up -d --build`
