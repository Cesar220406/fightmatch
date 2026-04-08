/**
 * FightMatch — Seed completo
 * Ejecutar: node database/seed-completo.js
 * Requiere DATABASE_URL en el entorno o .env en backend/
 *
 * Inserta:
 *   - 4 usuarios de prueba (admin, editor, gimnasio, cliente)
 *   - 6 gimnasios en ciudades españolas reales
 *   - Relaciones gimnasio ↔ arte marcial
 *   - Lesiones asignadas al usuario cliente
 */

require('dotenv').config({ path: __dirname + '/../backend/.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

const PASSWORD = 'Test1234!';
const COST = 12;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Hash de contraseña ──────────────────────────────────────────────
    console.log('⏳  Generando hashes de contraseña...');
    const hash = await bcrypt.hash(PASSWORD, COST);

    // ── 2. Usuarios de prueba ──────────────────────────────────────────────
    console.log('👤  Insertando usuarios...');
    const usuarios = [
      { email: 'admin@fightmatch.com',    nombre: 'Admin',    apellidos: 'FightMatch',  rol: 'admin'    },
      { email: 'editor@fightmatch.com',   nombre: 'Editor',   apellidos: 'FightMatch',  rol: 'editor'   },
      { email: 'gimnasio@fightmatch.com', nombre: 'Dojo',     apellidos: 'Propietario', rol: 'gimnasio' },
      { email: 'cliente@fightmatch.com',  nombre: 'Carlos',   apellidos: 'García',      rol: 'cliente'  },
    ];

    const userIds = {};
    for (const u of usuarios) {
      const { rows } = await client.query(
        `INSERT INTO usuarios (email, password_hash, nombre, apellidos, rol, activo, email_verificado)
         VALUES ($1,$2,$3,$4,$5,TRUE,TRUE)
         ON CONFLICT (email) DO UPDATE
           SET password_hash=$2, nombre=$3, apellidos=$4, rol=$5, activo=TRUE
         RETURNING id`,
        [u.email, hash, u.nombre, u.apellidos, u.rol]
      );
      userIds[u.rol] = rows[0].id;
      console.log(`  ✓ ${u.rol}: ${u.email}`);
    }

    // ── 3. Gimnasios ───────────────────────────────────────────────────────
    console.log('\n🏋️  Insertando gimnasios...');
    const gimnasios = [
      {
        nombre: 'Dragon Fight Club Madrid',
        slug: 'dragon-fight-club-madrid',
        descripcion: 'Centro de artes marciales en el corazón de Madrid. Más de 15 años formando campeones y deportistas de todos los niveles. Instalaciones de última generación con tatami profesional, saco de boxeo y sala de musculación.',
        direccion: 'Calle de Fuencarral, 45',
        ciudad: 'Madrid',
        provincia: 'Madrid',
        codigo_postal: '28004',
        telefono: '914 523 781',
        email_contacto: 'info@dragonfc.es',
        sitio_web: 'https://dragonfc.es',
        imagen_url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
        latitud: 40.4235,
        longitud: -3.7040,
        precio_desde: 55,
        verificado: true,
        horario: { lunes:'07:00-22:00', martes:'07:00-22:00', miercoles:'07:00-22:00', jueves:'07:00-22:00', viernes:'07:00-21:00', sabado:'09:00-14:00', domingo:'Cerrado' },
      },
      {
        nombre: 'Barcelona Martial Arts Academy',
        slug: 'barcelona-martial-arts-academy',
        descripcion: 'Academia premium en el Eixample barcelonés. Especializada en BJJ y Muay Thai con profesores de nivel internacional. Clases para adultos y niños, grupos reducidos para máxima atención personalizada.',
        direccion: 'Carrer del Consell de Cent, 302',
        ciudad: 'Barcelona',
        provincia: 'Barcelona',
        codigo_postal: '08007',
        telefono: '932 187 654',
        email_contacto: 'hola@bma.cat',
        sitio_web: 'https://bma.cat',
        imagen_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
        latitud: 41.3874,
        longitud: 2.1534,
        precio_desde: 65,
        verificado: true,
        horario: { lunes:'08:00-22:00', martes:'08:00-22:00', miercoles:'08:00-22:00', jueves:'08:00-22:00', viernes:'08:00-21:00', sabado:'10:00-15:00', domingo:'Cerrado' },
      },
      {
        nombre: 'Valencia Combat Center',
        slug: 'valencia-combat-center',
        descripcion: 'El mayor centro de artes marciales de la Comunitat Valenciana. 1.200 m² de instalaciones con 3 salas especializadas. Ofrecemos desde clases de iniciación hasta preparación para competición.',
        direccion: 'Avinguda del Regne de València, 18',
        ciudad: 'Valencia',
        provincia: 'Valencia',
        codigo_postal: '46005',
        telefono: '963 456 789',
        email_contacto: 'contacto@valenciacombat.com',
        sitio_web: 'https://valenciacombat.com',
        imagen_url: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800',
        latitud: 39.4699,
        longitud: -0.3763,
        precio_desde: 45,
        verificado: true,
        horario: { lunes:'07:30-22:00', martes:'07:30-22:00', miercoles:'07:30-22:00', jueves:'07:30-22:00', viernes:'07:30-21:00', sabado:'09:00-13:00', domingo:'Cerrado' },
      },
      {
        nombre: 'Sevilla Bushido Dojo',
        slug: 'sevilla-bushido-dojo',
        descripcion: 'Dojo tradicional en el barrio de Triana. Más de 20 años de experiencia en artes marciales japonesas. Ambiente familiar y profesional. Especialistas en rehabilitación deportiva a través del movimiento marcial.',
        direccion: 'Calle Betis, 67',
        ciudad: 'Sevilla',
        provincia: 'Sevilla',
        codigo_postal: '41010',
        telefono: '954 321 654',
        email_contacto: 'dojo@bushidosevilla.es',
        sitio_web: 'https://bushidosevilla.es',
        imagen_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        latitud: 37.3831,
        longitud: -6.0014,
        precio_desde: 40,
        verificado: true,
        horario: { lunes:'09:00-21:00', martes:'09:00-21:00', miercoles:'09:00-21:00', jueves:'09:00-21:00', viernes:'09:00-20:00', sabado:'10:00-13:00', domingo:'Cerrado' },
      },
      {
        nombre: 'Málaga Fight Academy',
        slug: 'malaga-fight-academy',
        descripcion: 'Academia moderna junto al Puerto de Málaga. Entrenamiento de alta intensidad con enfoque en la salud y el bienestar. Nuestros instructores están certificados para adaptar el entrenamiento a deportistas con lesiones.',
        direccion: 'Muelle Uno, Local 24',
        ciudad: 'Málaga',
        provincia: 'Málaga',
        codigo_postal: '29016',
        telefono: '952 789 123',
        email_contacto: 'info@malagafight.es',
        sitio_web: 'https://malagafight.es',
        imagen_url: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800',
        latitud: 36.7213,
        longitud: -4.4209,
        precio_desde: 42,
        verificado: false,
        horario: { lunes:'08:00-21:00', martes:'08:00-21:00', miercoles:'08:00-21:00', jueves:'08:00-21:00', viernes:'08:00-20:00', sabado:'09:00-12:00', domingo:'Cerrado' },
      },
      {
        nombre: 'Bilbao Athletic Dojo',
        slug: 'bilbao-athletic-dojo',
        descripcion: 'Referente vasco de las artes marciales. Ubicado en el barrio de Indautxu, combina la tradición de las artes marciales orientales con métodos de entrenamiento modernos. Campeones del País Vasco en Judo y BJJ.',
        direccion: 'Calle Iparraguirre, 15',
        ciudad: 'Bilbao',
        provincia: 'Vizcaya',
        codigo_postal: '48011',
        telefono: '944 567 890',
        email_contacto: 'kontaktua@bilbaodojo.eus',
        sitio_web: 'https://bilbaodojo.eus',
        imagen_url: 'https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=800',
        latitud: 43.2627,
        longitud: -2.9389,
        precio_desde: 50,
        verificado: true,
        horario: { lunes:'07:00-22:00', martes:'07:00-22:00', miercoles:'07:00-22:00', jueves:'07:00-22:00', viernes:'07:00-21:00', sabado:'09:00-13:00', domingo:'Cerrado' },
      },
    ];

    const gymIds = {};
    for (const g of gimnasios) {
      const { rows } = await client.query(
        `INSERT INTO gimnasios
           (propietario_id, nombre, slug, descripcion, direccion, ciudad, provincia,
            codigo_postal, telefono, email_contacto, sitio_web, imagen_url,
            latitud, longitud, precio_desde, verificado, horario, activo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE)
         ON CONFLICT (slug) DO UPDATE
           SET descripcion=$4, direccion=$5, ciudad=$6, verificado=$16
         RETURNING id`,
        [
          userIds['gimnasio'], g.nombre, g.slug, g.descripcion, g.direccion,
          g.ciudad, g.provincia, g.codigo_postal, g.telefono, g.email_contacto,
          g.sitio_web, g.imagen_url, g.latitud, g.longitud,
          g.precio_desde, g.verificado, JSON.stringify(g.horario),
        ]
      );
      gymIds[g.slug] = rows[0].id;
      console.log(`  ✓ ${g.nombre} (${g.ciudad})`);
    }

    // ── 4. Insertar artes marciales base ──────────────────────────────────
    console.log('\n🥋  Insertando artes marciales...');
    const arteId = {};
    const artesMarciales = [
      { nombre: 'Boxeo',        slug: 'boxeo',        descripcion: 'Arte marcial de puños, excelente para cardio y coordinación.', impacto_fisico: 'Alto impacto en hombros, muñecas y cuello.' },
      { nombre: 'Muay Thai',    slug: 'muay-thai',    descripcion: 'Arte marcial tailandesa que usa puños, codos, rodillas y piernas.', impacto_fisico: 'Impacto en piernas, rodillas y caderas.' },
      { nombre: 'BJJ',          slug: 'bjj',          descripcion: 'Brazilian Jiu-Jitsu. Arte de suelo y sumisiones.', impacto_fisico: 'Estrés en cuello, hombros y rodillas.' },
      { nombre: 'Judo',         slug: 'judo',         descripcion: 'Arte marcial japonesa de proyecciones y derribos.', impacto_fisico: 'Impacto en columna, hombros y rodillas.' },
      { nombre: 'Karate',       slug: 'karate',       descripcion: 'Arte marcial japonesa de golpes y bloqueos.', impacto_fisico: 'Moderado, bajo si se practica kata.' },
      { nombre: 'Taekwondo',    slug: 'taekwondo',    descripcion: 'Arte marcial coreana enfocada en patadas.', impacto_fisico: 'Alto impacto en rodillas, tobillos y cadera.' },
      { nombre: 'Tai Chi',      slug: 'tai-chi',      descripcion: 'Arte marcial china de movimientos lentos y meditativos.', impacto_fisico: 'Muy bajo impacto, ideal para rehabilitación.' },
      { nombre: 'Yoga Marcial', slug: 'yoga-marcial', descripcion: 'Combinación de yoga y artes marciales para flexibilidad y fuerza.', impacto_fisico: 'Muy bajo impacto, mejora movilidad articular.' },
    ];
    for (const a of artesMarciales) {
      const { rows: ar } = await client.query(
        `INSERT INTO artes_marciales (nombre, slug, descripcion, impacto_fisico)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (slug) DO UPDATE SET nombre=$1, descripcion=$3
         RETURNING id`,
        [a.nombre, a.slug, a.descripcion, a.impacto_fisico]
      );
      arteId[a.slug] = ar[0].id;
      console.log(`  ✓ ${a.nombre}`);
    }

    // ── 5. Insertar lesiones base ──────────────────────────────────────────
    console.log('\n🩹  Insertando lesiones...');
    const lesiones = [
      { nombre: 'Esguince de tobillo',       slug: 'esguince-tobillo',        zona: 'tobillo',  severidad: 'leve',     descripcion: 'Distensión de los ligamentos del tobillo.' },
      { nombre: 'Dolor crónico de rodilla',  slug: 'dolor-cronico-rodilla',   zona: 'rodilla',  severidad: 'moderada', descripcion: 'Dolor persistente en la articulación de la rodilla.' },
      { nombre: 'Rotura de LCA',             slug: 'rotura-lca',              zona: 'rodilla',  severidad: 'grave',    descripcion: 'Rotura del ligamento cruzado anterior.' },
      { nombre: 'Hernia discal lumbar',      slug: 'hernia-discal-lumbar',    zona: 'columna',  severidad: 'moderada', descripcion: 'Protrusión de disco intervertebral en la zona lumbar.' },
      { nombre: 'Tendinitis de hombro',      slug: 'tendinitis-hombro',       zona: 'hombro',   severidad: 'moderada', descripcion: 'Inflamación del tendón del manguito rotador.' },
      { nombre: 'Epicondilitis (codo)',       slug: 'epicondilitis',           zona: 'codo',     severidad: 'leve',     descripcion: 'Inflamación de los tendones del codo (codo de tenista).' },
      { nombre: 'Luxación de hombro',        slug: 'luxacion-hombro',         zona: 'hombro',   severidad: 'grave',    descripcion: 'Desplazamiento del húmero fuera de la articulación.' },
      { nombre: 'Fractura de muñeca',        slug: 'fractura-muneca',         zona: 'muñeca',   severidad: 'grave',    descripcion: 'Fractura del radio distal u otros huesos del carpo.' },
      { nombre: 'Dolor crónico de cadera',   slug: 'dolor-cronico-cadera',    zona: 'cadera',   severidad: 'moderada', descripcion: 'Dolor persistente en la articulación coxofemoral.' },
      { nombre: 'Esguince cervical',         slug: 'esguince-cervical',       zona: 'columna',  severidad: 'leve',     descripcion: 'Distensión de los músculos y ligamentos cervicales.' },
    ];
    for (const l of lesiones) {
      await client.query(
        `INSERT INTO lesiones (nombre, slug, descripcion, zona_corporal, severidad)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (slug) DO UPDATE SET nombre=$1, descripcion=$3`,
        [l.nombre, l.slug, l.descripcion, l.zona, l.severidad]
      );
      console.log(`  ✓ ${l.nombre}`);
    }

    // ── 6. Compatibilidades arte ↔ lesión ─────────────────────────────────
    console.log('\n🔗  Insertando compatibilidades...');
    const compatibilidades = [
      // Tai Chi y Yoga Marcial: compatibles con casi todo
      ['tai-chi',      'esguince-tobillo',      true,  'principiante', 'Movimientos lentos, sin impacto.'],
      ['tai-chi',      'dolor-cronico-rodilla', true,  'principiante', 'Mejora movilidad sin carga.'],
      ['tai-chi',      'hernia-discal-lumbar',  true,  'principiante', 'Fortalece core sin flexiones bruscas.'],
      ['tai-chi',      'tendinitis-hombro',     true,  'principiante', 'Movimientos suaves del hombro.'],
      ['tai-chi',      'epicondilitis',         true,  'principiante', 'Sin impacto en codo.'],
      ['tai-chi',      'dolor-cronico-cadera',  true,  'principiante', 'Ideal para movilidad de cadera.'],
      ['tai-chi',      'esguince-cervical',     true,  'principiante', 'Relaja tensión cervical.'],
      ['yoga-marcial', 'esguince-tobillo',      true,  'principiante', 'Fortalece estabilidad de tobillo.'],
      ['yoga-marcial', 'dolor-cronico-rodilla', true,  'principiante', 'Estiramiento suave de cuádriceps.'],
      ['yoga-marcial', 'hernia-discal-lumbar',  true,  'principiante', 'Posturas adaptadas para lumbar.'],
      ['yoga-marcial', 'tendinitis-hombro',     true,  'principiante', 'Movilidad controlada de hombro.'],
      ['yoga-marcial', 'epicondilitis',         true,  'principiante', 'Estiramiento de antebrazo.'],
      ['yoga-marcial', 'dolor-cronico-cadera',  true,  'principiante', 'Abre la cadera gradualmente.'],
      ['yoga-marcial', 'esguince-cervical',     true,  'principiante', 'Estira y relaja cuello.'],
      // Karate adaptado: compatible con lesiones leves/moderadas
      ['karate',       'esguince-tobillo',      true,  'intermedio',   'Evitar patadas de giro.'],
      ['karate',       'epicondilitis',         true,  'intermedio',   'Kata sin contacto.'],
      ['karate',       'esguince-cervical',     true,  'principiante', 'Solo kata, sin esparring.'],
      ['karate',       'dolor-cronico-rodilla', false, null,           'Las posturas bajas sobrecargan la rodilla.'],
      ['karate',       'rotura-lca',            false, null,           'Contraindicado por las patadas y giros.'],
      ['karate',       'hernia-discal-lumbar',  false, null,           'Las rotaciones pueden agravar la hernia.'],
      // BJJ: contraindicado con lesiones de hombro/columna, ok para tobillo
      ['bjj',          'esguince-tobillo',      true,  'intermedio',   'Trabajo de suelo sin peso en tobillo.'],
      ['bjj',          'epicondilitis',         true,  'intermedio',   'Con protección de codo.'],
      ['bjj',          'tendinitis-hombro',     false, null,           'Las palancas estresan el hombro.'],
      ['bjj',          'luxacion-hombro',       false, null,           'Alto riesgo de re-luxación.'],
      ['bjj',          'hernia-discal-lumbar',  false, null,           'Posiciones de suelo pueden agravar.'],
      ['bjj',          'dolor-cronico-rodilla', false, null,           'Posiciones de guardia sobrecargan rodilla.'],
      // Boxeo: ok con rodilla/tobillo si es técnica, mal con hombro/muñeca
      ['boxeo',        'dolor-cronico-rodilla', true,  'intermedio',   'Cardio sin impacto en rodilla.'],
      ['boxeo',        'hernia-discal-lumbar',  true,  'intermedio',   'Footwork suave, sin torsión brusca.'],
      ['boxeo',        'tendinitis-hombro',     false, null,           'Los golpes sobrecargan el hombro.'],
      ['boxeo',        'fractura-muneca',       false, null,           'Contraindicado hasta recuperación total.'],
      ['boxeo',        'epicondilitis',         false, null,           'Los golpes agravan el codo.'],
      ['boxeo',        'esguince-tobillo',      false, null,           'El footwork requiere tobillo estable.'],
      // Muay Thai: similar al boxeo pero más piernas
      ['muay-thai',    'hernia-discal-lumbar',  true,  'intermedio',   'Solo técnica de brazos, sin patadas.'],
      ['muay-thai',    'esguince-tobillo',      false, null,           'Las patadas y el footwork requieren tobillo sano.'],
      ['muay-thai',    'dolor-cronico-rodilla', false, null,           'Las patadas giratorias sobrecargan la rodilla.'],
      ['muay-thai',    'rotura-lca',            false, null,           'Completamente contraindicado.'],
      ['muay-thai',    'tendinitis-hombro',     false, null,           'Los codos y puños estresan el hombro.'],
      // Judo: proyecciones, mal para columna y hombro
      ['judo',         'esguince-tobillo',      true,  'intermedio',   'Trabajo de suelo sin apoyo de tobillo.'],
      ['judo',         'hernia-discal-lumbar',  false, null,           'Las proyecciones comprimen la columna.'],
      ['judo',         'luxacion-hombro',       false, null,           'Las caídas pueden re-luxar el hombro.'],
      ['judo',         'dolor-cronico-rodilla', false, null,           'Los agarres y barridos sobrecargan la rodilla.'],
      // Taekwondo: muy orientado a piernas
      ['taekwondo',    'tendinitis-hombro',     true,  'principiante', 'Poca implicación de hombros.'],
      ['taekwondo',    'epicondilitis',         true,  'principiante', 'Poca implicación de codos.'],
      ['taekwondo',    'esguince-tobillo',      false, null,           'Las patadas requieren tobillo íntegro.'],
      ['taekwondo',    'dolor-cronico-rodilla', false, null,           'Las patadas altas sobrecargan la rodilla.'],
      ['taekwondo',    'rotura-lca',            false, null,           'Contraindicado.'],
    ];

    let compInserted = 0;
    for (const [arteSlug, lesionSlug, compatible, nivel, notas] of compatibilidades) {
      const aId = arteId[arteSlug];
      const lRes = await client.query('SELECT id FROM lesiones WHERE slug=$1', [lesionSlug]);
      const lId = lRes.rows[0]?.id;
      if (!aId || !lId) { console.warn(`  ⚠ Compatibilidad no insertada: ${arteSlug} ↔ ${lesionSlug}`); continue; }
      await client.query(
        `INSERT INTO compatibilidades (arte_marcial_id, lesion_id, compatible, nivel_recomendado, notas, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (arte_marcial_id, lesion_id) DO UPDATE SET compatible=$3, nivel_recomendado=$4, notas=$5`,
        [aId, lId, compatible, nivel ?? null, notas ?? null, userIds['admin']]
      );
      compInserted++;
    }
    console.log(`  ✓ ${compInserted} compatibilidades insertadas`);

    console.log(`  ✓ ${Object.keys(arteId).length} artes listas:`, Object.keys(arteId).join(', '));

    // ── 8. Relaciones gimnasio ↔ arte marcial ─────────────────────────────
    console.log('\n🔗  Asociando artes marciales a gimnasios...');
    const asociaciones = [
      // Dragon Fight Club Madrid — boxeo, muay thai, bjj, karate
      ['dragon-fight-club-madrid',       'boxeo'],
      ['dragon-fight-club-madrid',       'muay-thai'],
      ['dragon-fight-club-madrid',       'bjj'],
      ['dragon-fight-club-madrid',       'karate'],
      // Barcelona Martial Arts Academy — bjj, muay thai, judo
      ['barcelona-martial-arts-academy', 'bjj'],
      ['barcelona-martial-arts-academy', 'muay-thai'],
      ['barcelona-martial-arts-academy', 'judo'],
      // Valencia Combat Center — boxeo, karate, taekwondo, muay thai
      ['valencia-combat-center',         'boxeo'],
      ['valencia-combat-center',         'karate'],
      ['valencia-combat-center',         'taekwondo'],
      ['valencia-combat-center',         'muay-thai'],
      // Sevilla Bushido Dojo — judo, tai-chi, yoga-marcial, karate
      ['sevilla-bushido-dojo',           'judo'],
      ['sevilla-bushido-dojo',           'tai-chi'],
      ['sevilla-bushido-dojo',           'yoga-marcial'],
      ['sevilla-bushido-dojo',           'karate'],
      // Málaga Fight Academy — boxeo, muay thai, yoga-marcial, tai-chi
      ['malaga-fight-academy',           'boxeo'],
      ['malaga-fight-academy',           'muay-thai'],
      ['malaga-fight-academy',           'yoga-marcial'],
      ['malaga-fight-academy',           'tai-chi'],
      // Bilbao Athletic Dojo — bjj, judo, karate, taekwondo
      ['bilbao-athletic-dojo',           'bjj'],
      ['bilbao-athletic-dojo',           'judo'],
      ['bilbao-athletic-dojo',           'karate'],
      ['bilbao-athletic-dojo',           'taekwondo'],
    ];

    let linked = 0;
    for (const [gymSlug, arteSlug] of asociaciones) {
      const gId = gymIds[gymSlug];
      const aId = arteId[arteSlug];
      if (!gId) { console.warn(`  ⚠ Gym no encontrado: ${gymSlug}`); continue; }
      if (!aId) { console.warn(`  ⚠ Arte no encontrada: ${arteSlug}`); continue; }
      await client.query(
        'INSERT INTO gimnasio_artes_marciales (gimnasio_id, arte_marcial_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [gId, aId]
      );
      linked++;
    }
    console.log(`  ✓ ${linked} relaciones insertadas`);

    // ── 9. Lesiones para usuario cliente ──────────────────────────────────
    console.log('\n🦵  Asignando lesiones al usuario cliente...');
    const { rows: lesionRows } = await client.query(
      "SELECT id, slug FROM lesiones WHERE activo=TRUE AND slug IN ('esguince-tobillo','dolor-cronico-rodilla')"
    );
    for (const l of lesionRows) {
      await client.query(
        'INSERT INTO usuario_lesiones (usuario_id, lesion_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [userIds['cliente'], l.id]
      );
      console.log(`  ✓ Lesión ${l.slug} → cliente`);
    }

    await client.query('COMMIT');
    console.log('\n✅  Seed completado correctamente.\n');
    console.log('Credenciales de prueba (password: Test1234!):');
    console.log('  admin@fightmatch.com    → admin');
    console.log('  editor@fightmatch.com   → editor');
    console.log('  gimnasio@fightmatch.com → gimnasio');
    console.log('  cliente@fightmatch.com  → cliente');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌  Error durante el seed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
