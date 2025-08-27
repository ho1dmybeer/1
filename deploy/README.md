Деплой (prod) с Docker Compose и GHCR

Требования:
- Сервер с Docker и docker compose
- Домен (опционально) и открытый 80/443

Вариант A: Собрать и поднять локально с исходников
```
git clone https://github.com/<user>/<repo>.git
cd <repo>
# настроить окружение
$env:SECRET_KEY="<strong_secret>"   # Windows PowerShell пример
$env:POSTGRES_PASSWORD="<password>"
# запуск
docker compose -f docker-compose.prod.yml up -d --build
```

Вариант B: Использовать образы из GHCR (после релиза)
- В workflows/release.yml создайте релиз на GitHub → образы появятся в ghcr.io
- На сервере выполните:
```
docker login ghcr.io -u <github_user> -p <GH_PAT_or_GITHUB_TOKEN>
# В docker-compose.prod.yml замените build на image для backend и frontend
# и пропишите теги ghcr.io/<org>/<repo>-backend:latest и frontend:latest

docker compose -f docker-compose.prod.yml up -d
```

TLS/HTTPS
- Проще всего: Traefik или Caddy. Либо добавить server { listen 443 ssl; } в Nginx и certbot.
- При необходимости — подготовлю конкретный конфиг под ваш домен.
