# Cómo conectar el frontend de Entreteca con Supabase

## Estado actual del proyecto

El frontend **ya está preparado** para conectarse a Supabase. El código tiene un patrón de fallback:
- Si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están en `.env.local` → usa Supabase real.
- Si no están → usa datos mock en memoria (modo demo).

El archivo `.env.local` ya fue creado con las credenciales correctas, así que **la conexión ya está activa**.

---

## Archivos clave de la integración

### 1. `src/core/supabase.js` — El cliente

```js
import { createClient } from '@supabase/supabase-js'

const url    = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,   // sesión guardada en localStorage
    autoRefreshToken: true, // renueva el JWT antes de que expire
    detectSessionInUrl: true, // maneja el callback de recuperar contraseña
  },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
```

Este cliente es el punto de entrada a todo. Se importa en el repositorio y en el AuthContext.

### 2. `.env.local` — Credenciales (no subir a git)

```env
VITE_SUPABASE_URL=https://uaiecsrhhjkgdzycyejm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_MAPS_API_KEY=          ← pendiente
```

> `.env.local` ya está en `.gitignore` de Vite por defecto. Nunca commitearlo.

### 3. `src/core/auth/AuthContext.jsx` — Autenticación

Maneja el estado de sesión globalmente. Provee:

| Valor | Tipo | Descripción |
|-------|------|-------------|
| `user` | objeto | Usuario de `auth.users` (id, email) |
| `profile` | objeto | Fila de `public.usuario` (nombre, avatar_url, rol) |
| `isAuthenticated` | boolean | `true` si hay sesión activa |
| `isAdmin` | boolean | `true` si `profile.rol === 'admin'` |
| `loading` | boolean | `true` mientras carga la sesión inicial |
| `signUp(email, password, nombre)` | función | Registra usuario |
| `signIn(email, password)` | función | Inicia sesión |
| `signOut()` | función | Cierra sesión |
| `resetPassword(email)` | función | Envía email de recuperación |

Se consume en cualquier componente con el hook:
```js
import { useAuth } from '@/core/auth/useAuth'
const { user, profile, isAdmin, signOut } = useAuth()
```

### 4. `src/model/entretecaRepository.js` — Todas las llamadas a datos

Contiene todas las funciones que hablan con Supabase. Cada función tiene la forma:

```js
export async function listarLugares({ idCategoria, comuna, costo, q } = {}) {
  if (!isSupabaseConfigured) { /* retorna mock */ }

  // Llamada real a Supabase
  return supabase.from('lugar')
    .select('*, categoria:id_categoria(id_categoria, nombre, icono)')
    .order('nombre')
}
```

---

## Flujo de autenticación completo

### Registro
1. Usuario llena el form en `/registro` (nombre, email, password).
2. `signUp({ email, password, nombre })` llama `supabase.auth.signUp()`.
3. Supabase crea la fila en `auth.users` con `raw_user_meta_data = { nombre }`.
4. El trigger `on_auth_user_created` se dispara automáticamente y crea la fila en `public.usuario`.
5. Supabase envía un email de confirmación (configurable en el dashboard).
6. Al confirmar, la sesión queda activa y `AuthContext` carga el profile.

### Login
1. `signIn({ email, password })` llama `supabase.auth.signInWithPassword()`.
2. Supabase devuelve un objeto `session` con un JWT.
3. El JWT se guarda en `localStorage` (persistSession: true).
4. `AuthContext` detecta el cambio de sesión via `onAuthStateChange` y carga el profile desde `public.usuario`.

### Sesión persistente
- Al recargar la página, `supabase.auth.getSession()` recupera la sesión desde `localStorage`.
- Si el JWT expiró, `autoRefreshToken: true` lo renueva automáticamente con el refresh token.

### Recuperación de contraseña
1. `resetPassword({ email })` llama `supabase.auth.resetPasswordForEmail()`.
2. Supabase envía un email con un link que redirige a `<origin>/recuperar-password/nueva`.
3. `detectSessionInUrl: true` intercepta el token del URL y activa la sesión.

---

## Cómo se protegen las rutas

En `App.jsx` las rutas usan `<ProtectedRoute>`:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/favoritos" element={<FavoritosPage />} />
  <Route path="/perfil"    element={<PerfilPage />} />
</Route>

<Route element={<ProtectedRoute requireAdmin />}>
  <Route path="/admin"          element={<AdminDashboard />} />
  <Route path="/admin/lugares"  element={<AdminLugares />} />
  ...
</Route>
```

`ProtectedRoute` usa `isAuthenticated` e `isAdmin` de `AuthContext`. Si el usuario no cumple la condición, redirige a `/login`.

---

## Patrón de llamada a datos en los ViewModels

Los ViewModels usan `useAsyncData` que espera funciones que retornan `{ data, error }`:

```js
// En el ViewModel
const cargarLugares = useCallback(() => listarLugares({ idCategoria }), [idCategoria])
const { data: lugares, loading, error } = useAsyncData(cargarLugares)
```

```js
// useAsyncData internamente hace:
fn().then((res) => {
  setResult({ data: res?.data ?? null, error: res?.error ?? null })
})
```

Todas las funciones del repositorio respetan este shape `{ data, error }`.

---

## Llamadas a Edge Functions (operaciones admin)

Las funciones admin del repositorio ya no van a Supabase directo, sino a las Edge Functions:

```js
// entretecaRepository.js
async function callAdmin(fn, method, path = '', body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,       // JWT del usuario logueado
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,  // requerido por Supabase
    },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) return { data: null, error: new Error(json.error) }
  return { data: json, error: null }
}
```

El header `apikey` con la anon key es requerido por el gateway de Supabase para identificar el proyecto.

---

## Pasos para verificar que todo funciona

1. **Iniciar el servidor de desarrollo:**
   ```
   npm run dev
   ```

2. **Verificar que no está en modo mock:** En la consola del navegador no debe aparecer el warning `[Entreteca] Falta configurar...`.

3. **Registrar un usuario** en `/registro`. Verificar en el dashboard de Supabase:
   - Authentication → Users: debe aparecer el nuevo usuario.
   - Table Editor → `usuario`: debe aparecer la fila creada por el trigger.

4. **Promover a admin** (solo para el equipo de desarrollo):
   ```sql
   -- Ejecutar en SQL Editor del dashboard Supabase
   UPDATE public.usuario SET rol = 'admin'
   WHERE id_usuario = '<uuid-del-usuario>';
   ```

5. **Verificar el panel admin** en `/admin`. Si `isAdmin` es `true`, se redirige correctamente. Las operaciones CRUD deben funcionar via Edge Functions.

6. **Verificar reseñas:** Al estar logueado, publicar una reseña en un lugar y comprobar que aparece en Table Editor → `resena`.

---

## Consideraciones de seguridad

| Regla | Por qué |
|-------|---------|
| `.env.local` nunca en git | Expone la anon key (aunque es pública, es buena práctica) |
| `SERVICE_KEY` solo en Edge Functions | Bypasea RLS; si llega al frontend, cualquiera tiene acceso total |
| `verify_jwt: true` en Edge Functions | Impide llamadas sin autenticación |
| RLS activo en todas las tablas | Protege los datos incluso si alguien usa la anon key directo |
| Constraint XOR en resena y favorito | Garantiza integridad en la BD, no solo en el código |
