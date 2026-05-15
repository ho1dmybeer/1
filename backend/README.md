# Backend

Backend написан на FastAPI.

## Основные endpoints

Проверка:

- `GET /health`

Авторизация сотрудника:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Рабочие смены сотрудника:

- `GET /api/work-sessions/current`
- `GET /api/work-sessions/my`
- `POST /api/work-sessions/start`
- `POST /api/work-sessions/lunch/start`
- `POST /api/work-sessions/lunch/end`
- `POST /api/work-sessions/finish`

Администратор:

- `POST /api/admin/login`
- `GET /api/admin/work-sessions`
- `PATCH /api/admin/work-sessions/{id}`
- `DELETE /api/admin/work-sessions/{id}`

Старые endpoints `/api/timesheet` оставлены в проекте, но основной текущий сценарий работает через `/api/work-sessions`.

## Переменные окружения

- `DATABASE_URL` - подключение к базе данных.
- `SECRET_KEY` - секретный ключ JWT.
- `ADMIN_USERNAME` - имя администратора, по умолчанию `admin`.
- `ADMIN_PASSWORD` - пароль администратора, по умолчанию `555555`.

## Локальный запуск без Docker

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --app-dir backend
```

Проверка:

```bash
curl http://127.0.0.1:8000/health
```
