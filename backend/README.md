Запуск backend (FastAPI)

1) Требуется Python 3.11+
2) Установка зависимостей:
```
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```
3) Переменные окружения (опционально):
- `DATABASE_URL` (по умолчанию sqlite:///./data.db)
- `SECRET_KEY` для JWT

4) Запуск сервера:
```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Эндпоинты:
- GET /health
- POST /api/auth/register
- POST /api/auth/login (OAuth2PasswordRequestForm)
- GET /api/auth/me
- GET/POST/DELETE /api/timesheet
