# 1. Define the local cache database path
proxy_cache_path /var/cache/nginx/convex_images levels=1:2 keys_zone=convex_image_cache:10m max_size=5g inactive=30d use_temp_path=off;


server {
    server_name proxy.bereg-go.ru;

    # Force using IPv4 for international routing stability
    resolver 8.8.8.8 ipv6=off;

    # Custom cache status tracking header
    add_header X-Cache-Status $upstream_cache_status;

    # ==========================================
    # ROUTE 1: WEBSOCKET PROXY (Convex Real-time)
    # ==========================================
    location / {
        proxy_pass https://brave-dinosaur-650.convex.cloud;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host brave-dinosaur-650.convex.cloud;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_ssl_server_name on;
        proxy_ssl_name brave-dinosaur-650.convex.cloud;
    }

    # ==========================================
    # ROUTE 2: IMAGE CACHE (Saves Convex Traffic)
    # ==========================================
    location ~ ^/event-images/(.*)$ {
        proxy_cache convex_image_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_lock on;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;

        # Strip cache limits to force permanent disk caching
        proxy_ignore_headers Cache-Control Expires Set-Cookie X-Accel-Expires;

        # Forward the captured image path and any query strings
        proxy_pass https://convex.cloud/api/storage/$1$is_args$args;

        proxy_ssl_server_name on;
        proxy_ssl_name brave-dinosaur-650.convex.cloud;
        proxy_set_header Host brave-dinosaur-650.convex.cloud;

        # Strip downstream headers to prevent clients from bypassing cache
        proxy_hide_header Set-Cookie;
           proxy_hide_header Vary;
        proxy_hide_header Cache-Control;
        proxy_hide_header Expires;
    }

    # Certbot SSL lines (Make sure these match your newly generated paths)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/bereg-go.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bereg-go.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Automated HTTP to HTTPS redirect
server {
    if ($host = www.bereg-go.ru) {
        return 301 https://$host$request_uri;
    }
    if ($host = bereg-go.ru) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name proxy.bereg-go.ru;
    return 404;
}