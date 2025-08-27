Traefik + HTTPS (Let's Encrypt)

1) На сервере установите Docker и docker compose.
2) Создайте файл `deploy/traefik/docker-compose.yml` (он уже в репозитории).
3) Экспортируйте переменные:
```
export LE_EMAIL=<your@email>
```
4) Запустите traefik:
```
docker compose -f deploy/traefik/docker-compose.yml up -d
```
5) В `docker-compose.prod.yml` добавьте метки к сервисам frontend и backend, чтобы Traefik проксировал домены.

Пример меток (labels) для frontend (Nginx):
```
    labels:
      - traefik.enable=true
      - traefik.http.routers.front.rule=Host(`example.com`)
      - traefik.http.routers.front.entrypoints=websecure
      - traefik.http.routers.front.tls.certresolver=le
```
Для backend (если нужен отдельный домен или поддомен):
```
    labels:
      - traefik.enable=true
      - traefik.http.routers.api.rule=Host(`api.example.com`)
      - traefik.http.routers.api.entrypoints=websecure
      - traefik.http.routers.api.tls.certresolver=le
```
Если фронт проксирует `/api` на backend, отдельный домен для API не обязателен.
