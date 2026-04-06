#!/bin/bash
# ============================================================
# FightMatch — Instalación completa en un solo comando
# ============================================================
set -e

VERDE='\033[0;32m'
ROJO='\033[0;31m'
AMARILLO='\033[1;33m'
AZUL='\033[0;34m'
NC='\033[0m'

clear
echo -e "${AZUL}"
echo "  ███████╗██╗ ██████╗ ██╗  ██╗████████╗███╗   ███╗ █████╗ ████████╗ ██████╗██╗  ██╗"
echo "  ██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝████╗ ████║██╔══██╗╚══██╔══╝██╔════╝██║  ██║"
echo "  █████╗  ██║██║  ███╗███████║   ██║   ██╔████╔██║███████║   ██║   ██║     ███████║"
echo "  ██╔══╝  ██║██║   ██║██╔══██║   ██║   ██║╚██╔╝██║██╔══██║   ██║   ██║     ██╔══██║"
echo "  ██║     ██║╚██████╔╝██║  ██║   ██║   ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╗██║  ██║"
echo "  ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${VERDE}  Instalador automático — Contabo VPS${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Solicitar datos ────────────────────────────────────────────────────────────
echo -e "${AMARILLO}Necesito 4 datos para instalarlo todo. Pulsa Enter para confirmar cada uno.${NC}"
echo ""

read -p "  1. URL del repo en GitHub (ej: https://github.com/usuario/fightmatch): " REPO_URL
read -p "  2. Tu dominio (ej: fightmatch.duckdns.org): " DOMAIN
read -p "  3. Tu email (para el certificado SSL): " EMAIL

echo ""
echo -e "${AMARILLO}  Ahora elige contraseñas seguras:${NC}"
read -s -p "  4. Contraseña para la base de datos: " DB_PASS
echo ""
read -s -p "  5. Repite la contraseña: " DB_PASS2
echo ""

if [ "$DB_PASS" != "$DB_PASS2" ]; then
  echo -e "${ROJO}❌ Las contraseñas no coinciden. Vuelve a ejecutar el script.${NC}"
  exit 1
fi

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${AZUL}  Resumen:${NC}"
echo "  Repo:    $REPO_URL"
echo "  Dominio: $DOMAIN"
echo "  Email:   $EMAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Todo correcto? Escribe 'si' para continuar: " CONFIRMAR
if [ "$CONFIRMAR" != "si" ]; then
  echo "Instalación cancelada."
  exit 0
fi

# ── 1. Actualizar sistema ──────────────────────────────────────────────────────
echo ""
echo -e "${VERDE}[1/6] Actualizando el sistema...${NC}"
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Instalar Docker ────────────────────────────────────────────────────────
echo -e "${VERDE}[2/6] Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker --now
else
  echo "  Docker ya instalado, saltando..."
fi

# ── 3. Instalar utilidades + firewall ─────────────────────────────────────────
echo -e "${VERDE}[3/6] Configurando firewall...${NC}"
apt-get install -y -qq git ufw
ufw --force reset > /dev/null
ufw default deny incoming > /dev/null
ufw default allow outgoing > /dev/null
ufw allow ssh > /dev/null
ufw allow http > /dev/null
ufw allow https > /dev/null
ufw --force enable > /dev/null

# ── 4. Clonar repositorio ─────────────────────────────────────────────────────
echo -e "${VERDE}[4/6] Clonando repositorio...${NC}"
if [ -d "/opt/fightmatch" ]; then
  echo "  Directorio existente, actualizando..."
  cd /opt/fightmatch && git pull origin main
else
  git clone "$REPO_URL" /opt/fightmatch
  cd /opt/fightmatch
fi

# ── 5. Crear .env.prod ────────────────────────────────────────────────────────
echo -e "${VERDE}[5/6] Creando configuración de producción...${NC}"
cat > /opt/fightmatch/.env.prod <<EOF
DOMAIN=$DOMAIN
POSTGRES_USER=fightmatch
POSTGRES_PASSWORD=$DB_PASS
POSTGRES_DB=fightmatch
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
EOF

# Reemplazar dominio en Nginx
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" /opt/fightmatch/nginx/conf.d/fightmatch.conf

# ── 6. SSL + Deploy ───────────────────────────────────────────────────────────
echo -e "${VERDE}[6/6] Lanzando servicios y obteniendo certificado SSL...${NC}"
cd /opt/fightmatch

# Levantar solo nginx+certbot primero para el challenge HTTP
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d db nginx certbot
echo "  Esperando que Nginx arranque..."
sleep 10

# Obtener certificado
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" 2>&1 | tail -5

# Levantar todo
echo "  Construyendo y levantando todos los servicios (puede tardar 2-3 minutos)..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# ── Resultado ─────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${VERDE}"
echo "  ✅ ¡FightMatch instalado correctamente!"
echo ""
echo "  🌐 Accede en: https://$DOMAIN"
echo ""
echo "  Comandos útiles:"
echo "    Ver logs:      docker compose -f /opt/fightmatch/docker-compose.prod.yml logs -f"
echo "    Actualizar:    cd /opt/fightmatch && bash scripts/update.sh"
echo "    Estado:        docker compose -f /opt/fightmatch/docker-compose.prod.yml ps"
echo -e "${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
