# Proyecto Portafolio — Guía para Claude

## Orden de trabajo: código primero, documentación después

La carpeta `Documentacion/` está **desactualizada** y no es fuente de verdad.
Antes de explicar, decidir o tocar algo, **lee el código real**; recién después
contrasta (y, si toca, corrige) la documentación contra lo que el código hace.

Desfases conocidos a hoy:

- **Supabase ya no existe.** El frontend dejó de usar `@supabase/supabase-js`.
  La capa de datos ahora es un cliente REST (`src/core/api.js`) contra un
  **backend propio en Spring Boot** (`Producto/backend/eventout-backend`).
  Ignora todo lo que la doc diga sobre Supabase, Edge Functions, RLS o el
  cliente `supabase.js` (ya eliminado).
- Docs con info obsoleta: `documentacion-completa.md`,
  `conectar-frontend-supabase.md`, `edge-functions-y-autorizacion.md`.
  La vigente es `arquitectura-backend-springboot.md`.

## Tests del frontend

- Viven todos **directamente** en `Producto/frontend/src/test/` (planos, sin
  subcarpetas; p. ej. `src/core/utils.js` → `src/test/utils.test.js`). No se
  colocan junto al código.
- Importan el código bajo prueba con el alias `@/` (no rutas relativas).
- Stack: Vitest + Testing Library + jsdom. Config en `vitest.config.js`
  (setup en `src/test/setup.js`). Correr: `npm test` desde `Producto/frontend`.
