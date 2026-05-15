# Деплой на сервер

Это простой ручной деплой через Docker Compose. Первый рабочий вариант рассчитан на запуск по IP сервера без домена и HTTPS. Домен и HTTPS можно добавить следующим шагом.

## 1. Требования к серверу

Нужен VPS с Ubuntu и открытым портом `80`.

Если на сервере уже стоит nginx или apache, он может занимать порт `80`. Для первого запуска проще использовать чистый сервер или остановить старый веб-сервер.

## 2. Установить Docker

На сервере выполнить:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

После этого выйти из SSH и зайти снова, чтобы применились права группы `docker`.

Проверить:

```bash
docker --version
docker compose version
```

## 3. Скачать проект

Первый раз:

```bash
git clone https://github.com/ho1dmybeer/1.git time-tracker
cd time-tracker
```

Если проект уже есть на сервере:

```bash
cd time-tracker
git pull
```

## 4. Настроить `.env`

Создать файл:

```bash
cp .env.example .env
nano .env
```

Пример:

```env
POSTGRES_USER=tracker
POSTGRES_PASSWORD=your_strong_database_password
POSTGRES_DB=tracker
SECRET_KEY=your_long_random_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

Обязательно заменить:

- `POSTGRES_PASSWORD`
- `SECRET_KEY`
- `ADMIN_PASSWORD`

Секретный ключ можно сгенерировать так:

```bash
openssl rand -hex 32
```

Если оставить `ADMIN_PASSWORD=555555`, админ сможет входить с этим паролем. Для реального сервера безопаснее поставить свой пароль.

## 5. Запустить приложение

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверить контейнеры:

```bash
docker compose -f docker-compose.prod.yml ps
```

Должны быть запущены:

- `db`
- `backend`
- `frontend`

## 6. Проверить сайт

Проверка backend:

```bash
curl http://SERVER_IP/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

Открыть сайт:

```text
http://SERVER_IP/
```

Проверить:

- регистрация сотрудника;
- вход сотрудника;
- старт работы;
- пауза на обед;
- продолжение работы;
- завершение работы;
- вход администратора;
- редактирование строки администратором.

## 7. Обновить проект на сервере

```bash
cd time-tracker
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 8. Посмотреть логи

Backend:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Frontend:

```bash
docker compose -f docker-compose.prod.yml logs -f frontend
```

База данных:

```bash
docker compose -f docker-compose.prod.yml logs -f db
```

## 9. Остановить приложение

```bash
docker compose -f docker-compose.prod.yml down
```

Эта команда не удаляет данные PostgreSQL.

## 10. Не удалять данные случайно

Данные PostgreSQL лежат в Docker volume `pg_data`.

Не выполнять на рабочем сервере без полной уверенности:

```bash
docker compose -f docker-compose.prod.yml down -v
```

Флаг `-v` удалит volume и может удалить данные табеля.

## 11. Домен и HTTPS

После проверки по IP можно подключить домен и HTTPS. Варианты:

- Caddy
- Traefik
- Nginx + Certbot

Для первого запуска это не обязательно. Сначала лучше убедиться, что приложение стабильно работает по IP.
