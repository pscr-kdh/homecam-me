#!/bin/bash

REPO_URL="https://github.com/pscr-kdh/homecam-me.git"
CLONE_DIR="$HOME/homecam-me"
NGINX_CONF="/etc/nginx/sites-available/homecam-me"
SSL_DIR="/etc/ssl/homecam-me"
NODE_MAJOR=20

git clone "$REPO_URL" "$CLONE_DIR"

sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
sudo apt install nginx
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update && sudo apt-get install nodejs -y

cd "$CLONE_DIR"

npx next build
npx next start

mkdir ~/.hc
sudo mkdir /hc-tmp
sudo chown $USER $HOME /hc-tmp
sudo mkdir -p "$SSL_DIR"

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$SSL_DIR/selfsigned.key" -out "$SSL_DIR/selfsigned.crt" -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=example.com"

# Configure Nginx
if [ ! -f "$NGINX_CONF" ]; then
    cat > "$NGINX_CONF" <<EOF

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate "$SSL_DIR/selfsigned.crt";
    ssl_certificate_key "$SSL_DIR/selfsigned.key";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    ln -s "$NGINX_CONF" "/etc/nginx/sites-enabled/"
    nginx -t && systemctl restart nginx
else
    echo "Nginx configuration already exists."
fi

echo "Setup complete!"
