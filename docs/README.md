# GRUPO-3-ELECTIVO-IA

## Qué es la solución
Aplicación de monitoreo del nivel de combustible de una flota de camiones mineros sin operador. Lee el nivel de combustible existente, alerta automáticamente bajo un umbral crítico y ordena una cola de prioridades de reabastecimiento.

## Para quién es
Para el controlador de flota, que hoy coordina más de 30 camiones y no siempre detecta a tiempo los niveles críticos. Beneficia al jefe de turno de operaciones de mina, al jefe de turno de planta y al planificador de mantención.

## Cómo se instala y se ejecuta
El prototipo navegable no necesita instalación: se abre `prototipo/index.html` en el navegador, o el enlace publicado en [docs/prototipo.md](docs/prototipo.md): https://grupo-3-electivo-ia-prototipo.vercel.app/ (accesible sin iniciar sesión). El prototipo usa datos de ejemplo y no se conecta a una base de datos. La prueba de concepto (PoC) de `src/` sí guarda en una base de datos real: ver la sección siguiente.

## Prueba de concepto (PoC): órdenes de reabastecimiento (HU-04 y HU-05)

**Qué hace:** con inicio de sesión, cada persona ve y hace solo lo que le corresponde a su rol sobre la orden de reabastecimiento:
- El **controlador de flota** asigna órdenes (camión, sector de encuentro y camión de combustible), ve todas, confirma el cierre (HU-05) y anula las que él emitió, con motivo.
- El **operador del camión de combustible** ve solo las órdenes de su camión y las marca «en proceso».

El servidor valida los datos y el permiso antes de guardar, y la base de datos lo vuelve a revisar con sus políticas (RLS). Una orden anulada no se borra: queda guardada con su motivo.

- **Dirección pública:** https://grupo-3-electivo-ia-src.vercel.app/
- **Video Avance 8 · pruebas de permisos con dos cuentas (2–3 min):** PENDIENTE (pegar el enlace)
- **Video Avance 7 · PoC (1–2 min):** https://drive.google.com/file/d/11jzKxETePE0DpHelf8HaKgvgIpvL6DFd/view?usp=sharing
- **Cuentas de prueba:** dos cuentas ficticias, una de controlador y una de operador. Se enviaron por correo a la profesora y **no están en el repositorio**.

**Documentos:**
- Arquitectura y camino delgado: [docs/arquitectura.md](docs/arquitectura.md)
- Reglas de validación y pruebas de robustez: [docs/robustecimiento.md](docs/robustecimiento.md)
- Matriz de permisos, políticas RLS y pruebas de rotura: [docs/permisos.md](docs/permisos.md)

**Tecnología:** página web sin librerías (`src/index.html`), funciones del servidor en Vercel (`src/api/`), base de datos y cuentas en Supabase (`src/db/esquema.sql` y Supabase Auth) y publicación en Vercel desde la rama `main`. No hay que instalar nada en el computador.

**Variables de entorno** (solo los nombres están en [.env.example](.env.example); los valores van en Vercel, nunca en el repositorio):

| Variable | Dónde se obtiene |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL (termina en `.supabase.co`) |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key (`sb_publishable_…`) |

La clave secreta de Supabase **no se usa**: el servidor trabaja siempre con el token de la persona que inició sesión, para que las políticas RLS se apliquen. La clave pública queda solo en el servidor; el navegador no habla directo con Supabase.

**Cómo reproducirla desde cero** (solo navegador, unos 20 minutos):

1. **Proyecto.** En [supabase.com](https://supabase.com) → **New project** (región São Paulo).
2. **Cuentas.** En **Authentication → Users → Add user → Create new user**, crear `controlador.a@ejemplo.cl` y `operador.a@ejemplo.cl`, cada una con su contraseña y con **Auto Confirm User** marcado. Los correos tienen que ser esos, porque `esquema.sql` les asigna el rol por correo.
3. **Cerrar el registro.** En **Authentication → Sign In / Providers**, apagar **Allow new users to sign up**. Así nadie puede crearse una cuenta por su cuenta (denegar por defecto).
4. **Base de datos.** En **SQL Editor → New query**, pegar todo `src/db/esquema.sql` y apretar **Run**. Si pregunta por una operación destructiva, confirmar.
5. **Publicación.** En [vercel.com](https://vercel.com) → **Add New → Project** → importar este repositorio → **Root Directory: `src`** → agregar las dos variables de la tabla → **Deploy**. En **Settings → Deployment Protection**, la dirección de producción debe abrir sin iniciar sesión en Vercel.
6. **Probar.** Entrar como controlador y asignar CAM-07 + Sector A + Camión de combustible 1. Debe aparecer «✓ Orden ORD-002 registrada». Luego entrar como operador en otra ventana de incógnito: la orden aparece en su lista y puede marcarla «en proceso». Las pruebas completas están en `docs/robustecimiento.md` y `docs/permisos.md`.

Para volver a los datos iniciales, se ejecuta de nuevo `src/db/esquema.sql`. Las cuentas no se borran.

## En qué estado está
Actualidad: Robustecimiento funcional, seguridad y permisos sobre la orden de reabastecimiento (Avance 8).
Etapas previas: Arquitectura y prueba de concepto de la acción más frágil, asignar la orden (Avance 7); Diseño de prueba de usuarios, pauta de validación y plan de levantamiento (Avance 6); Propuesta de valor (Avance 1); Caso de uso, maqueta y roadmap (Avance 2); Repositorio, uso documentado de IA y estructura de datos (Avance 3); Historias de usuario y Wireframes (Avance 4); Prototipo navegable y análisis ético del prototipo (Avance 5).

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
- Robustecimiento: [docs/robustecimiento.md](docs/robustecimiento.md) · Permisos: [docs/permisos.md](docs/permisos.md)
