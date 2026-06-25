-- =============================================================================
-- Actualiza las fechas de los eventos sembrados a julio 2026.
--
-- ¿Por qué este script? El seed (DataInitializer.seedEventos) solo corre cuando
-- la tabla `evento` está vacía. Como tu BD ya tiene los eventos (fechas de junio),
-- editar el seed Java NO los actualiza: hay que correr este UPDATE una vez.
--
-- Cómo usarlo (MySQL Workbench): abre este archivo, selecciona el esquema correcto
-- y ejecuta todo (rayo). Las fechas coinciden con DataInitializer.java y mockData.js.
-- Idempotente: puedes correrlo las veces que quieras; siempre deja los mismos valores.
-- =============================================================================

USE eventout_db;

-- Ópera Carmen — viernes 17-jul, 20:00–23:00 (+ corrige "marzo" -> "julio")
UPDATE evento
   SET fecha_inicio = '2026-07-17 20:00:00',
       fecha_fin    = '2026-07-17 23:00:00',
       descripcion  = 'La famosa ópera de Bizet en el Teatro Municipal. 4 funciones en julio.'
 WHERE id_evento = 'evento-1';

-- Yoga al amanecer — sábado 11-jul, 07:30–08:30
UPDATE evento
   SET fecha_inicio = '2026-07-11 07:30:00',
       fecha_fin    = '2026-07-11 08:30:00'
 WHERE id_evento = 'evento-2';

-- Exposición Arte Contemporáneo — muestra larga: 01-jul a 30-ago
UPDATE evento
   SET fecha_inicio = '2026-07-01 10:00:00',
       fecha_fin    = '2026-08-30 18:00:00'
 WHERE id_evento = 'evento-3';

-- Conversatorio Memoria y Democracia — miércoles 22-jul, 18:30–20:30
UPDATE evento
   SET fecha_inicio = '2026-07-22 18:30:00',
       fecha_fin    = '2026-07-22 20:30:00'
 WHERE id_evento = 'evento-4';

-- Feria de Emprendedores Bicentenario — domingo 26-jul, 11:00–19:00
UPDATE evento
   SET fecha_inicio = '2026-07-26 11:00:00',
       fecha_fin    = '2026-07-26 19:00:00'
 WHERE id_evento = 'evento-5';

-- Verificación: deberían verse las 5 fechas en julio (la exposición termina en agosto).
SELECT id_evento, nombre, fecha_inicio, fecha_fin
  FROM evento
 WHERE id_evento IN ('evento-1','evento-2','evento-3','evento-4','evento-5')
 ORDER BY fecha_inicio;
