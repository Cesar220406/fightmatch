# FightMatch

Plataforma para conectar personas con artes marciales y gimnasios según sus **lesiones** y **ubicación**.

## Stack

| Capa       | Tecnología                      |
|------------|---------------------------------|
| Frontend   | Next.js 14 + TypeScript         |
| Backend    | Node.js + Express               |
| Base datos | PostgreSQL 16                   |
| Deploy dev | Docker Compose                  |

---

## Estructura del proyecto

```
FightMatch/
├── frontend/        # Next.js
├── backend/         # Express API
├── database/        # Esquema SQL y seed
├── docs/            # Memoria del TFG
├── docker-compose.yml
└── .env.example
```

---

## Arranque rápido con Docker

```bash
# 1. Clona el repositorio
git clone <url>
cd FightMatch

# 2. Configura variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Levanta todos los servicios
docker compose up --build
```

Servicios disponibles:

| Servicio  | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000       |
| API       | http://localhost:4000/api   |
| DB        | localhost:5432              |

---

## Arranque en local (sin Docker)

### Base de datos

Requiere PostgreSQL 16 instalado y ejecutado.

```bash
psql -U postgres -c "CREATE DATABASE fightmatch;"
psql -U postgres -d fightmatch -f database/schema.sql
psql -U postgres -d fightmatch -f database/seed.sql
```

### Backend

```bash
cd backend
cp .env.example .env   # edita DATABASE_URL con tus credenciales
npm install
npm run dev            # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev            # http://localhost:3000
```

---

## API — Endpoints principales

| Método | Ruta                          | Descripción                              | Auth       |
|--------|-------------------------------|------------------------------------------|------------|
| POST   | `/api/auth/registro`          | Registro de usuario                      | —          |
| POST   | `/api/auth/login`             | Login, devuelve JWT                      | —          |
| GET    | `/api/gimnasios`              | Listado con filtros ciudad/arte/lesión   | —          |
| GET    | `/api/gimnasios/:slug`        | Detalle de gimnasio                      | —          |
| POST   | `/api/gimnasios`              | Crear gimnasio                           | gimnasio   |
| GET    | `/api/artes-marciales`        | Listado de artes marciales               | —          |
| GET    | `/api/artes-marciales/:slug`  | Detalle + compatibilidades               | —          |
| GET    | `/api/lesiones`               | Listado de lesiones                      | —          |
| GET    | `/api/lesiones/:slug`         | Detalle + artes compatibles              | —          |
| GET    | `/api/compatibilidades?lesiones=1,2` | Artes compatibles con lesiones  | —          |
| POST   | `/api/compatibilidades`       | Crear/actualizar compatibilidad          | admin/editor |
| GET    | `/api/usuarios/me`            | Perfil del usuario autenticado           | JWT        |
| PUT    | `/api/usuarios/me/lesiones`   | Actualizar lesiones del usuario          | JWT        |
| GET    | `/api/posts`                  | Blog — listado                           | —          |
| GET    | `/api/posts/:slug`            | Blog — detalle                           | —          |
| POST   | `/api/posts`                  | Crear post                               | admin/editor |

---

## Roles

| Rol      | Permisos principales                                              |
|----------|-------------------------------------------------------------------|
| cliente  | Buscar gimnasios, guardar lesiones, favoritos                     |
| gimnasio | Todo lo de cliente + gestionar su propio gimnasio                 |
| editor   | Gestionar artes marciales, lesiones, compatibilidades y posts     |
| admin    | Acceso total                                                      |
