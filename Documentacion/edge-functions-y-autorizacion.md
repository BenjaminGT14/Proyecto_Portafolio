# Edge Functions y Autorización — Entreteca

## ¿Qué son las Supabase Edge Functions?

Son funciones serverless que corren en la infraestructura de Supabase (Deno Deploy). Funcionan como un **backend API**: reciben requests HTTP, ejecutan lógica en el servidor y devuelven JSON. Se diferencian del cliente JS de Supabase en que corren en el servidor y pueden usar la `service_role` key, que **omite todas las políticas RLS**.

URL de cada función:
```
https://uaiecsrhhjkgdzycyejm.supabase.co/functions/v1/<nombre-función>
```

---

## Las 3 funciones desplegadas

### 1. `admin-lugares`
Maneja el CRUD completo de la tabla `lugar`.

| Método | Path | Acción |
|--------|------|--------|
| GET | `/admin-lugares` | Lista todos los lugares con su categoría |
| POST | `/admin-lugares` | Crea un lugar nuevo (body = campos del lugar) |
| PUT | `/admin-lugares/:id` | Actualiza un lugar por UUID |
| DELETE | `/admin-lugares/:id` | Elimina un lugar por UUID |

### 2. `admin-eventos`
Maneja el CRUD completo de la tabla `evento`.

| Método | Path | Acción |
|--------|------|--------|
| GET | `/admin-eventos` | Lista todos los eventos con su lugar |
| POST | `/admin-eventos` | Crea un evento nuevo |
| PUT | `/admin-eventos/:id` | Actualiza un evento por UUID |
| DELETE | `/admin-eventos/:id` | Elimina un evento por UUID |

### 3. `admin-resenas`
Maneja la moderación de reseñas.

| Método | Path | Acción |
|--------|------|--------|
| GET | `/admin-resenas` | Lista TODAS las reseñas (todos los estados) con votos y autor |
| PATCH | `/admin-resenas/:id` | Cambia el `estado` de una reseña (`visible` / `oculta` / `eliminada`) |

---

## Cómo funciona la autorización (paso a paso)

Cada función aplica **dos capas de verificación** antes de ejecutar cualquier operación:

### Capa 1 — JWT verificado por el runtime (verify_jwt: true)

Al desplegar la función con `verify_jwt: true`, el runtime de Supabase intercepta el request **antes** de que llegue al código. Verifica que:
- El header `Authorization: Bearer <token>` exista.
- El token sea un JWT válido firmado por ese proyecto Supabase.
- El token no esté expirado.

Si falla → el runtime devuelve `401` automáticamente, sin ejecutar el código.

### Capa 2 — Verificación de rol admin en el código

Dentro del código de cada función existe la función `verificarAdmin`:

```typescript
async function verificarAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false

  // Crea un cliente con el JWT del usuario para identificarlo
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error } = await userClient.auth.getUser()
  if (error || !user) return false

  // Usa service_role para consultar el rol (bypass RLS, lectura segura)
  const db = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data } = await db
    .from('usuario')
    .select('rol')
    .eq('id_usuario', user.id)
    .single()

  return data?.rol === 'admin'  // Solo pasa si rol === 'admin'
}
```

Si no es admin → la función devuelve `403 Forbidden` con `{ error: "Acceso denegado: se requiere rol admin" }`.

### ¿Por qué dos capas?

| Capa | ¿Qué bloquea? |
|------|--------------|
| JWT (runtime) | Usuarios no autenticados, tokens expirados o inválidos |
| Rol admin (código) | Usuarios autenticados pero con `rol = 'usuario'` |

---

## El cliente service_role vs anon

Dentro de las funciones se usan **dos clientes Supabase distintos**:

```typescript
const ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Para identificar al usuario (respeta RLS)
const userClient = createClient(SUPABASE_URL, ANON_KEY, {
  global: { headers: { Authorization: authHeader } }
})

// Para las operaciones admin (omite RLS, acceso total)
const db = createClient(SUPABASE_URL, SERVICE_KEY)
```

- `userClient` con la anon key + JWT del usuario: se usa **solo para verificar la identidad** (`auth.getUser()`). Respeta RLS.
- `db` con service_role: se usa para **ejecutar la operación** (INSERT/UPDATE/DELETE). Omite RLS porque ya verificamos manualmente que es admin.

> **Importante:** La `SERVICE_KEY` nunca debe exponerse al frontend. Solo existe en el servidor (Edge Function). Las variables de entorno `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` se inyectan automáticamente en las Edge Functions de Supabase.

---

## Row Level Security (RLS) — El sistema de autorización de la BD

RLS es el mecanismo de PostgreSQL que filtra filas según el usuario que hace la consulta. Supabase lo activa por tabla.

### Función helper `es_admin()`

```sql
create or replace function public.es_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.usuario
    where id_usuario = auth.uid() and rol = 'admin'
  );
$$;
```

`auth.uid()` es una función de Supabase que devuelve el UUID del usuario autenticado a partir del JWT. `security definer` hace que se ejecute con los permisos del creador (no del llamador), para evitar recursión en RLS.

### Resumen de políticas por tabla

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `categoria` | Todos | Admin | Admin | Admin |
| `lugar` | Todos | Admin | Admin | Admin |
| `evento` | Todos | Admin | Admin | Admin |
| `usuario` | Todos | — (trigger) | Propietario o admin | Admin |
| `resena` | Visibles + propietario + admin | Auth (propio) | Propietario o admin | Propietario o admin |
| `voto_resena` | Propio | Propio | Propio | Propio |
| `favorito` | Propio | Propio | — | Propio |

### ¿Por qué la vista `resena_con_votos` tiene `security_invoker = true`?

Por defecto, las vistas en PostgreSQL corren con los permisos de quien las creó (`security definer`), lo que **bypasea RLS**. Con `security_invoker = true` (disponible en PostgreSQL 15+), la vista hereda los permisos del usuario que la consulta, por lo que las políticas de `resena` y `voto_resena` se aplican normalmente.

---

## Flujo completo de una operación admin

Ejemplo: el admin elimina un lugar desde el panel.

```
Frontend (AdminLugares.jsx)
  → llama eliminarLugar(id) en entretecaRepository.js
    → callAdmin('admin-lugares', 'DELETE', `/${id}`)
      → fetch('https://...supabase.co/functions/v1/admin-lugares/<id>', {
          method: 'DELETE',
          headers: { Authorization: 'Bearer <JWT del admin>' }
        })
        → Runtime verifica JWT [Capa 1]
          → verificarAdmin() comprueba rol='admin' en BD [Capa 2]
            → db (service_role) ejecuta DELETE en lugar
              → ← { ok: true }
```

---

## Variables de entorno disponibles en Edge Functions

Estas se inyectan automáticamente, no es necesario configurarlas:

| Variable | Contenido |
|----------|-----------|
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_ANON_KEY` | Clave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada (bypass RLS) — NUNCA exponer al frontend |
| `SUPABASE_DB_URL` | Conexión directa a PostgreSQL |
