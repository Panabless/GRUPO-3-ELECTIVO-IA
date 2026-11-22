# GRUPO-3-ELECTIVO-IA

## Qué es la solución
Aplicación de monitoreo del nivel de combustible de una flota de camiones mineros sin operador. Lee el nivel de combustible existente, alerta automáticamente bajo un umbral crítico y ordena una cola de prioridades de reabastecimiento.

## Para quién es
Para el controlador de flota, que hoy coordina más de 30 camiones y no siempre detecta a tiempo los niveles críticos. Beneficia al jefe de turno de operaciones de mina, al jefe de turno de planta y al planificador de mantención.

## Cómo se instala y se ejecuta
El prototipo navegable no necesita instalación: se abre `prototipo/index.html` en el navegador, o el enlace publicado en [docs/prototipo.md](docs/prototipo.md): https://grupo-3-electivo-ia-prototipo.vercel.app/ (accesible sin iniciar sesión). El prototipo usa datos de ejemplo y no se conecta a una base de datos. La prueba de concepto (PoC) de `src/` sí guarda en una base de datos real: ver la sección siguiente.

## Prueba de concepto (PoC): asignar orden (HU-04)

**Qué hace:** el controlador elige el camión que necesita combustible, el sector de encuentro y el camión de combustible (con su operador). El servidor valida los datos y guarda la orden en Supabase. La pantalla muestra el folio (ORD-001, ORD-002…) o un mensaje de error claro sin borrar lo elegido. Arquitectura, camino delgado y evidencia: [docs/arquitectura.md](docs/arquitectura.md).

- **Dirección pública:** (https://grupo-3-electivo-ia-src.vercel.app/)
- **Video (1–2 min):** PENDIENTE (pegar el enlace)

**Tecnología:** página web sin librerías (`src/index.html`), funciones del servidor en Vercel (`src/api/`), base de datos Supabase (`src/db/esquema.sql`) y publicación en Vercel desde la rama `main`. No hay que instalar nada en el computador.

**Variables de entorno** (solo los nombres están en [.env.example](.env.example); los valores van en Vercel, nunca en el repositorio):

| Variable | Dónde se obtiene |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret key (o la clave `service_role` antigua) |

**Cómo reproducirla desde cero** (solo navegador, unos 15 minutos):

1. **Base de datos.** Crear una cuenta gratis en [supabase.com](https://supabase.com) → **New project** (región São Paulo). Abrir **SQL Editor → New query**, pegar todo el contenido de `src/db/esquema.sql` y apretar **Run**. Si pregunta por una operación destructiva, confirmar. En **Table Editor** deben aparecer las 6 tablas con datos de ejemplo.
2. **Claves.** Copiar `SUPABASE_URL` y `SUPABASE_SECRET_KEY` desde los lugares de la tabla de arriba.
3. **Publicación.** En [vercel.com](https://vercel.com) → **Add New → Project** → importar este repositorio → **Root Directory: `src`** → abrir **Environment Variables** y agregar las dos variables → **Deploy**.
4. **Probar el flujo.** Abrir la dirección que entrega Vercel, elegir CAM-07, Sector A y Camión de combustible 1, y apretar **Enviar orden**. Debe aparecer «✓ Orden ORD-001 registrada» y la orden en la tabla de abajo y en Supabase (Table Editor → `orden`).
5. **Probar un error.** Abrir la misma dirección con `?prueba` al final, elegir CAM-12, cualquier sector y «Camión de combustible 2 · fuera de servicio». Debe decir «La orden no se guardó…» y en Supabase no debe aparecer una fila nueva.

Para volver a los datos iniciales, se ejecuta de nuevo `src/db/esquema.sql`.

## En qué estado está
Actualidad: Arquitectura y prueba de concepto de la acción más frágil, asignar la orden (Avance 7).
Etapas previas: Diseño de prueba de usuarios, pauta de validación y plan de levantamiento (Avance 6); Propuesta de valor (Avance 1); Caso de uso, maqueta y roadmap (Avance 2); Repositorio, uso documentado de IA y estructura de datos (Avance 3); Historias de usuario y Wireframes (Avance 4); Prototipo navegable y análisis ético del prototipo (Avance 5).

## Quiénes la desarrollan
Equipo 3: Simón Gallardo, Ikki Saito, Natalia Órdenes, Gabriel Vásquez y Nicolás Rodríguez.

## Entregables
- Entregables Unidad 1 (Avances 1 y 2): [docs/unidad1/](docs/unidad1/)
- Estructura de datos: [docs/datos/estructura_datos.md](docs/datos/estructura_datos.md)
- Bitácora de uso de IA: [docs/bitacora-ia/bitacora_ia.md](docs/bitacora-ia/bitacora_ia.md)
- Historias de usuario: [docs/historias.md](docs/historias.md)
- Wireframes: [docs/wireframes/](docs/wireframes/)
- Prototipo navegable: [docs/prototipo.md](docs/prototipo.md)
- Análisis ético: [docs/etica.md](docs/etica.md)
- Diseño de prueba de usuarios: [docs/prueba-usuarios.md](docs/prueba-usuarios.md)
- Pauta de validación: [docs/pauta-validacion.md](docs/pauta-validacion.md)
- Arquitectura y PoC: [docs/arquitectura.md](docs/arquitectura.md) · código en [src/](src/)
