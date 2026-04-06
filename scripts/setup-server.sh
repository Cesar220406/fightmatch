#!/bin/bash
# ============================================================
# FightMatch — Setup inicial del servidor Hetzner (Ubuntu 24.04)
# Ejecutar UNA SOLA VEZ como root en el servidor
# Uso: bash setup-server.sh
# ============================================================
set -e

echo ">>> [1/5] Actualizando sistema..."
apt-get update && apt-get upgrade -y

echo ">>> [2/5] Instalando Docker..."
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo ">>> [3/5] Habilitando Docker al arranque..."
systemctl enable docker
systemctl start docker

echo ">>> [4/5] Instalando utilidades..."
apt-get install -y git ufw fail2ban

echo ">>> [5/5] Configurando firewall básico (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo ""
echo "✅ Servidor listo. Ahora clona el repositorio y ejecuta deploy.sh"
echo "   git clone <URL_REPO> /opt/fightmatch"
echo "   cd /opt/fightmatch"
echo "   cp .env.prod.example .env.prod"
echo "   nano .env.prod  (edita las variables)"
echo "   bash scripts/deploy.sh"
