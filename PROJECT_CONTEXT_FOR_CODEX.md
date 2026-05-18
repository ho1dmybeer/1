# Контекст проекта для следующего диалога

Этот файл нужен, чтобы быстро восстановить контекст проекта в новом диалоге с Codex.

Важно: не хранить здесь root-пароль сервера, `SECRET_KEY`, пароль базы данных и другие секреты. Репозиторий публичный.

## Что это за проект

Проект: веб-приложение "Табель учета рабочего времени".

Репозиторий GitHub:

```text
https://github.com/ho1dmybeer/1
```

Локальная папка на Mac:

```text
/Users/bolat/Documents/ГПТ/cursor-project
```

Основные части:

- `frontend` - React + Vite, интерфейс пользователя и администратора.
- `backend` - FastAPI, авторизация, табель, админские endpoints.
- `db` - PostgreSQL, запускается через Docker.
- `docker-compose.prod.yml` - production-запуск frontend/backend/db.

## Текущий функционал

Главная страница:

- `Регистрация`
- `Вход`
- `Администратор`

Сотрудник:

- регистрируется по имени, email и паролю;
- входит по email и паролю;
- вводит проект;
- нажимает `Начать работу`;
- может один раз поставить `Пауза на обед`;
- нажимает `Продолжить работу`;
- пишет комментарий при необходимости;
- нажимает `Закончить работу`;
- видит историю в `Мои записи`.

Администратор:

- входит через отдельную страницу;
- данные по умолчанию: `admin` / `555555`;
- видит все рабочие смены;
- может изменить проект, начало, обед, окончание, комментарий;
- может закрыть смену, если сотрудник забыл завершить работу;
- может удалить ошибочную строку.

## Важные файлы документации

- `README.md` - краткое описание проекта и запуск.
- `DOCUMENTATION.md` - инструкция для пользователя, администратора и проверки.
- `DEPLOY.md` - деплой на сервер.
- `backend/README.md` - backend endpoints.
- `frontend/README.md` - frontend страницы и запуск.

## Локальный запуск

Production-вариант через Docker:

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка:

```bash
curl http://127.0.0.1/health
```

Открыть:

```text
http://127.0.0.1/
```

## Что делали при подключении к серверу

Арендовали обычный облачный сервер/VPS для демонстрации. Тариф был минимальный: 1 CPU, 1 GB RAM, 15 GB disk. Для демо достаточно, но при сборке Docker может не хватать памяти.

На сервере была Ubuntu:

```text
Ubuntu 24.04.4 LTS
```

Подключение выполнялось по SSH:

```bash
ssh root@<IP_СЕРВЕРА>
```

После входа проверяли:

```bash
whoami
cat /etc/os-release
```

Установили Docker:

```bash
curl -fsSL https://get.docker.com | sh
```

Проверяли:

```bash
docker --version
docker compose version
```

Скачали проект:

```bash
git clone https://github.com/ho1dmybeer/1.git time-tracker
cd time-tracker
```

Создали `.env`:

```bash
cp .env.example .env
openssl rand -hex 32
nano .env
```

В `.env` должны быть строки вида:

```env
POSTGRES_USER=tracker
POSTGRES_PASSWORD=<пароль_базы>
POSTGRES_DB=tracker
SECRET_KEY=<секретный_ключ_openssl>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=555555
```

Запуск на сервере:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка на сервере:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://127.0.0.1/health
```

Проверка из браузера:

```text
http://<IP_СЕРВЕРА>/
```

## Какие ошибки были и как решили

### 1. Ошибка `.env`: unexpected character `@`

Сообщение было примерно такое:

```text
failed to read /root/time-tracker/.env: line 5: unexpected character "@" in variable name
```

Причина: в `.env` случайно попала строка из терминала:

```text
root@...:~/time-tracker#
```

Решение:

```bash
sed -i '/^root@/d' .env
cat .env
```

В `.env` должны оставаться только строки `KEY=value`.

### 2. Команды случайно выполнялись не на сервере

После разрыва SSH команда была выполнена на Mac, а не на сервере.

Как отличать:

На сервере prompt примерно такой:

```text
root@...:~/time-tracker#
```

На Mac prompt примерно такой:

```text
bolat@MacBook-Air-Bolat cursor-project %
```

Команды деплоя нужно выполнять именно на сервере.

### 3. Docker build оборвался на сервере

Во время сборки соединение SSH закрылось. Вероятная причина: 1 GB RAM не хватило для сборки frontend/backend Docker images.

Решение: добавить swap 2 GB.

```bash
free -h
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
```

После swap повторили:

```bash
cd time-tracker
docker compose -f docker-compose.prod.yml up -d --build
```

Сборка прошла успешно. Контейнеры `db`, `backend`, `frontend` запустились.

### 4. Docker Hub TLS handshake timeout

Один раз была ошибка:

```text
TLS handshake timeout
```

Она возникла, когда команда выполнялась не там или Docker Hub отвечал медленно. Если повторится на сервере, обычно помогает повторить команду через пару минут:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Что важно помнить

- Docker нужен не всегда, но в этом проекте он сильно упрощает деплой.
- Docker Compose запускает три сервиса: PostgreSQL, backend, frontend.
- `frontend` открывает сайт на порту `80`.
- `backend` внутри Docker работает на `8000`, наружу идет через nginx frontend.
- PostgreSQL хранит данные в Docker volume `pg_data`.
- Нельзя выполнять на рабочем сервере без понимания:

```bash
docker compose -f docker-compose.prod.yml down -v
```

Флаг `-v` может удалить данные базы.

## Следующие возможные задачи

- Подключить домен.
- Настроить HTTPS.
- Сменить пароль администратора с `555555` на более надежный.
- Настроить резервное копирование PostgreSQL.
- Добавить экспорт табеля в Excel.
- Улучшить дизайн интерфейса.
