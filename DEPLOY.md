# Простой ручной деплой на сервер

Этот вариант специально без домена, HTTPS и GitHub Actions. Цель первого шага:
поднять приложение по IP сервера и убедиться, что backend, frontend и база
работают вместе.

## 1. Подготовить сервер

Нужен VPS с Ubuntu и открытым портом `80`. Если на сервере уже установлен
обычный nginx/apache, он может занимать порт `80`; на первом шаге проще его
остановить или выбрать чистый сервер.

Установить Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

После этого перезайдите по SSH, чтобы группа `docker` применилась.

Проверить:

```bash
docker --version
docker compose version
```

## 2. Скачать проект

```bash
git clone https://github.com/ho1dmybeer/1.git time-tracker
cd time-tracker
```

Если проект уже есть на сервере:

```bash
cd time-tracker
git pull
```

## 3. Настроить переменные окружения

```bash
cp .env.example .env
nano .env
```

Замените значения:

```env
POSTGRES_USER=tracker
POSTGRES_PASSWORD=your_strong_database_password
POSTGRES_DB=tracker
SECRET_KEY=your_long_random_secret_key
```

`SECRET_KEY` можно сгенерировать так:

```bash
openssl rand -hex 32
```

## 4. Запустить приложение

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверить контейнеры:

```bash
docker compose -f docker-compose.prod.yml ps
```

Проверить backend:

```bash
curl http://SERVER_IP/health
```

Открыть в браузере:

```text
http://SERVER_IP
```

## 5. Посмотреть логи, если что-то не работает

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f db
```

## 6. Обновить проект на сервере

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 7. Остановить приложение

```bash
docker compose -f docker-compose.prod.yml down
```

Данные PostgreSQL хранятся в Docker volume `pg_data` и не удаляются обычной
командой `down`.
