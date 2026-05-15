# Deploy

Основная инструкция деплоя находится в корневом файле [../DEPLOY.md](../DEPLOY.md).

В этой папке лежат дополнительные конфиги:

- `nginx/frontend.conf` - конфиг nginx внутри frontend-контейнера.
- `traefik/` - заготовка для будущего варианта с доменом и HTTPS.

Для первого запуска на сервере используйте простой вариант:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
