============================================================
  FIGHTMATCH - MATERIAL DE ENTREGA TFG
============================================================
  Alumno:  César Jiménez Ramírez
  Ciclo:   CFGS Desarrollo de Aplicaciones Web
  Curso:   2025-2026
  Tutor:   ---
============================================================


CONTENIDO DE ESTA CARPETA
--------------------------

  enlace_repositorio.txt
    Enlace al repositorio de GitHub con todo el codigo fuente
    del proyecto (frontend, backend, base de datos, Docker).

  enlace_produccion.txt
    Enlace a la aplicacion en produccion, ya desplegada y
    funcionando. Incluye las credenciales de prueba para
    cada rol (admin, gimnasio, cliente).

  fightmatch_database.sql
    Script SQL completo para recrear la base de datos desde
    cero. Incluye las 22 tablas, indices, tipos personalizados
    y datos de ejemplo (8 artes marciales, 12 gimnasios de
    ciudades espanolas, usuarios de prueba con distintos roles).
    Se puede ejecutar con:
      docker exec -i <contenedor_db> psql -U fightmatch -d fightmatch < fightmatch_database.sql

  capturas/
    Carpeta con capturas de pantalla de las pantallas
    principales de la aplicacion.


DESCRIPCION DEL PROYECTO
--------------------------
FightMatch es una plataforma web de artes marciales. Permite
buscar gimnasios filtrando por ciudad, arte marcial y lesiones
del usuario. Incluye sistema de suscripciones, panel de gestion
para propietarios de gimnasio, diario de noticias deportivas y
un test de personalidad para recomendar el arte marcial mas
adecuado segun el perfil del usuario.


TECNOLOGIAS
-----------
  Frontend:  Next.js 14 (App Router), TypeScript, Tailwind CSS
  Backend:   Node.js, Express, PostgreSQL
  Deploy:    Docker Compose + nginx + HTTPS (Let's Encrypt)
  VPS:       Debian en Scaleway


COMO LEVANTAR EN LOCAL
-----------------------
Requisitos: Docker y Docker Compose instalados.

  1. Pedir el archivo .env al alumno (no se sube al repo por seguridad)
  2. Desde la raiz del proyecto:
       docker compose up --build
  3. Abrir en el navegador:
       http://localhost:3000
  4. Cargar los datos iniciales:
       docker exec -i fightmatch_db psql -U fightmatch -d fightmatch < entrega/fightmatch_database.sql


CREDENCIALES DE PRUEBA (produccion y local)
--------------------------------------------
  ROL ADMIN     admin@fightmatch.com      /  Admin1234!
  ROL GIMNASIO  gimnasio@fightmatch.com   /  Gimnasio1234!
  ROL CLIENTE   cliente@fightmatch.com    /  Cliente1234!


PAGINAS PRINCIPALES
-------------------
  /                      Inicio
  /gimnasios             Buscador con filtros (ciudad, arte, lesion, geolocalizacion)
  /artes-marciales       Catalogo de artes marciales con mapa muscular
  /lesiones              Catalogo de lesiones con compatibilidades
  /buscar                Busqueda avanzada
  /comparar              Comparativa de dos artes marciales
  /noticias              Diario de artes marciales (Fight News)
  /test                  Test de personalidad
  /suscripcion/planes    Comparativa de planes de suscripcion
  /admin                 Panel de administracion  (necesita login admin)
  /perfil/gimnasio       Panel del gimnasio       (necesita login gimnasio)
  /perfil                Panel del usuario        (necesita login cliente)
