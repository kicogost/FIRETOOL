# FIRE Tracker

Aplicación de finanzas personales para el **mercado español** que convierte el
camino hacia la independencia financiera (FIRE) en algo motivador: cada euro
invertido **adelanta visiblemente tu fecha de libertad financiera**. Toda la
interfaz está en español y la moneda es el euro.

Está construida según [`fire-tracker-prd.md`](./fire-tracker-prd.md).

## Stack

- **Next.js** (App Router) + **TypeScript**
- **PGlite** (Postgres en proceso) con **Drizzle ORM** — mismo dialecto que
  Supabase, así que migrar a Supabase en el futuro es cambiar el driver y la
  cadena de conexión, no reescribir.
- **Tailwind CSS** + Recharts (gráficos) + react-markdown (módulos de aprendizaje)
- **Vitest** — el motor FIRE (`src/lib/fire.ts`) tiene cobertura completa.

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:3000  (crea y siembra ./.pglite la 1ª vez)
npm test             # toda la lógica pura + integración con BD en memoria
npm run test:coverage
npm run build
npm run db:generate  # regenera el SQL de migración desde el esquema Drizzle
```

La base de datos local vive en `./.pglite` (ignorada por git). Bórrala para
empezar de cero; al arrancar se vuelve a migrar y sembrar con datos de demo.

## Estructura

| Ruta | Qué es |
|---|---|
| `/` | Panel principal: progreso a FIRE, este mes, patrimonio, racha/logros, gastos, consejo |
| `/onboarding` → `/onboarding/summary` | Asistente de alta y pantalla "Tu punto de partida" |
| `/accounts` | Cuentas (efectivo, inversión, deuda) |
| `/import` | Importar movimientos desde CSV |
| `/coaching` → `/coaching/[slug]` | 6 módulos de educación financiera |
| `/debug` | Salida cruda del motor FIRE (desarrollo) |

Lógica pura y testeada en `src/lib/`: `fire.ts` (cálculos FIRE), `gamification.ts`
(rachas/logros), `coaching.ts` (qué módulo mostrar), `csv.ts` (importación).
Datos en `src/db/` (`schema.ts`, `queries.ts`, `mutations.ts`).

## Estado por fases (PRD §12)

- ✅ **Fase 1** — Motor FIRE + esquema + migraciones + tests.
- ✅ **Fase 2** — Entrada de movimientos, cuentas, panel.
- ✅ **Fase 3** — Onboarding y "Tu punto de partida".
- ✅ **Fase 4** — Rachas, logros, celebraciones (confeti / aviso según preferencia).
- ✅ **Fase 5** — Módulos de aprendizaje y motor de disparadores contextuales.
- 🟡 **Fase 6** — Parcial: **importación CSV implementada**. Pendiente (requiere
  servicios externos / credenciales, ver abajo).

## Fase 6: lo que falta y por qué

Estas piezas no se pueden completar sin decisiones y credenciales del propietario:

- **Autenticación / multiusuario.** El esquema ya está preparado: existe un único
  perfil fijo (`src/db/constants.ts → SINGLE_PROFILE_ID`) y todas las consultas
  van filtradas por `profileId`. Para activar multiusuario hace falta:
  1. Provisionar un proyecto **Supabase**, apuntar `DATABASE_URL` (ver
     `.env.example`) y aplicar las migraciones de `./drizzle`.
  2. Añadir **Supabase Auth** y sustituir `SINGLE_PROFILE_ID` por el id del
     usuario autenticado.
  3. Activar **Row Level Security** por `profile_id` (Postgres real; PGlite es de
     un solo usuario).
- **Sincronización bancaria.** Requiere una cuenta de pago con un agregador
  (**GoCardless Bank Account Data / Tink**, los habituales en España). Necesita
  credenciales de API, alta del proveedor y flujo de consentimiento PSD2. El
  formato del importador CSV es el punto de integración natural cuando se añada.

## Notas

- Educación financiera, **no** asesoramiento. El disclaimer es permanente en los
  módulos de aprendizaje.
- `npm audit` reporta vulnerabilidades en dependencias de desarrollo transitivas
  (herramientas de build de drizzle-kit); no afectan al runtime.
