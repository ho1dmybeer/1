# Табель учета рабочего времени

Веб-приложение для учета рабочего времени сотрудников организации.

Стек:

- Backend: FastAPI, SQLModel, JWT
- Frontend: React, Vite, React Query
- База данных: PostgreSQL в Docker
- Деплой: Docker Compose

## Что умеет приложение

- Регистрация сотрудника по имени, email и паролю.
- Вход сотрудника по email и паролю.
- Запуск рабочего дня по кнопке `Начать работу`.
- Одна пауза на обед за рабочую смену.
- Завершение работы с необязательным комментарием.
- История смен сотрудника.
- Отдельный вход администратора.
- Админ-панель со всеми рабочими сменами.
- Редактирование строк администратором, включая забытое окончание работы.
- Удаление ошибочных строк администратором.

## Основные адреса

При локальном Docker-запуске:

- Сайт: <http://127.0.0.1/>
- Проверка backend: <http://127.0.0.1/health>

На сервере вместо `127.0.0.1` используется IP сервера или домен.

## Данные администратора

По умолчанию:

- Имя: `admin`
- Пароль: `555555`

На сервере пароль лучше заменить в файле `.env` через переменную `ADMIN_PASSWORD`.

## Документация

- [DOCUMENTATION.md](DOCUMENTATION.md) - инструкция для пользователя, администратора и проверки перед запуском.
- [DEPLOY.md](DEPLOY.md) - пошаговый деплой на сервер.

## Быстрый запуск через Docker

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Проверить:

```bash
curl http://127.0.0.1/health
```

Открыть сайт:

```text
http://127.0.0.1/
```

## Локальная разработка без production-сборки

```bash
docker compose up --build
```

После запуска:

- Frontend: <http://127.0.0.1:5173/>
- Backend: <http://127.0.0.1:8000/health>

## Обновление с GitHub

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Полезные команды

Статус контейнеров:

```bash
docker compose -f docker-compose.prod.yml ps
```

Логи backend:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Логи frontend:

```bash
docker compose -f docker-compose.prod.yml logs -f frontend
```

Остановить приложение:

```bash
docker compose -f docker-compose.prod.yml down
```

Обычная команда `down` не удаляет данные PostgreSQL, потому что они лежат в Docker volume `pg_data`.
