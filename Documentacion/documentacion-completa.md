# Documentación Completa — Entreteca

> Proyecto Final · Duoc UC 2026  
> Stack: React 19 · Vite 8 · Tailwind CSS v4 · Supabase · Vercel

---

## Índice

1. [¿Qué es Entreteca?](#1-qué-es-entreteca)
2. [Herramientas y por qué se eligieron](#2-herramientas-y-por-qué-se-eligieron)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Arquitectura MVVM](#4-arquitectura-mvvm)
5. [Cómo React se conecta a Supabase](#5-cómo-react-se-conecta-a-supabase)
6. [Autenticación — flujo completo](#6-autenticación--flujo-completo)
7. [Confirmación de correo electrónico](#7-confirmación-de-correo-electrónico)
8. [Recuperación de contraseña](#8-recuperación-de-contraseña)
9. [Base de datos — schema completo](#9-base-de-datos--schema-completo)
10. [Row Level Security (RLS)](#10-row-level-security-rls)
11. [Triggers y funciones SQL](#11-triggers-y-funciones-sql)
12. [Edge Functions](#12-edge-functions)
13. [Componentes React complejos](#13-componentes-react-complejos)
14. [Routing y rutas protegidas](#14-routing-y-rutas-protegidas)
15. [Variables de entorno](#15-variables-de-entorno)
16. [Despliegue en Vercel](#16-despliegue-en-vercel)
17. [Modo demo (sin Supabase)](#17-modo-demo-sin-supabase)
18. [Glosario](#18-glosario)

---

## 1. ¿Qué es Entreteca?

Entreteca es una plataforma web para descubrir lugares, eventos culturales y actividades en Santiago de Chile. Los usuarios pueden:

- Explorar lugares y eventos con filtros (categoría, comuna, precio, fecha)
- Ver un mapa interactivo con todos los puntos georeferenciados
- Escribir reseñas con puntuación de 1 a 5 estrellas y votar las reseñas de otros
- Guardar favoritos (lugares y eventos)
- Administrar contenido desde un panel de administración (solo usuarios con rol `admin`)

---

## 2. Herramientas y por qué se eligieron

### Frontend

| Herramienta | Versión | ¿Para qué sirve? | ¿Por qué se eligió? |
|-------------|---------|-----------------|---------------------|
| **React** | 19 | Librería de interfaces de usuario basada en componentes | Estándar de la industria, ecosistema enorme, permite construir UIs reactivas con estado |
| **Vite** | 8 | Bundler y servidor de desarrollo | Extremadamente rápido, reemplaza a Webpack/CRA, excelente soporte para React |
| **React Router DOM** | 7 | Enrutamiento en el cliente (SPA) | Librería oficial para navegación en React, soporte para rutas dinámicas y anidadas |
| **Tailwind CSS** | v4 | Framework de estilos utilitario | Evita escribir CSS manual, clases predefinidas, sistema de diseño consistente |
| **class-variance-authority (CVA)** | 0.7 | Gestión de variantes de componentes UI | Permite crear componentes con múltiples variantes (ej: Button primary/secondary/outline) sin condicionales complejos |
| **clsx + tailwind-merge** | — | Combinar clases CSS condicionalmente | `clsx` maneja condiciones, `tailwind-merge` evita conflictos entre clases Tailwind |
| **Lucide React** | 1.16 | Librería de íconos SVG | Íconos modernos, ligeros, consistentes con el diseño |
| **react-leaflet + leaflet** | 5 / 1.9 | Mapa interactivo | Completamente gratuito, sin API key, basado en OpenStreetMap |

### Backend / Infraestructura

| Herramienta | ¿Para qué sirve? |
|-------------|-----------------|
| **Supabase** | Backend-as-a-Service: provee base de datos PostgreSQL, autenticación, Edge Functions y APIs REST/GraphQL automáticas |
| **PostgreSQL** | Base de datos relacional usada por Supabase |
| **Supabase Auth** | Sistema de autenticación con email/password, JWT, manejo de sesiones |
| **Supabase Edge Functions** | Funciones serverless en Deno para operaciones de administración que requieren `service_role` |
| **Vercel** | Plataforma de despliegue para aplicaciones frontend, integración con Git |

### Herramientas de desarrollo

| Herramienta | Uso |
|-------------|-----|
| **ESLint** | Análisis estático del código para detectar errores y malas prácticas |
| **eslint-plugin-react-hooks** | Valida que los hooks de React se usen correctamente |
| **Git + GitHub** | Control de versiones y colaboración |

---

## 3. Estructura del proyecto

```
Proyecto_Portafolio/
├── Documentacion/           ← Archivos de documentación
└── Producto/                ← Código fuente
    ├── public/              ← Archivos estáticos (favicon.svg)
    ├── src/
    │   ├── assets/          ← Imágenes (hero-santiago.webp)
    │   ├── core/            ← Núcleo de la aplicación
    │   │   ├── supabase.js          ← Cliente Supabase
    │   │   ├── utils.js             ← Utilidades (cn, formatPrecio, formatFecha…)
    │   │   └── auth/
    │   │       ├── AuthContext.jsx  ← Proveedor global de autenticación
    │   │       ├── authContextObject.js  ← createContext()
    │   │       └── useAuth.js       ← Hook para consumir el contexto
    │   ├── model/           ← Capa de datos
    │   │   ├── entretecaRepository.js  ← Facade Supabase/Mock
    │   │   └── mockData.js              ← Datos estáticos para modo demo
    │   ├── viewmodel/       ← Lógica de negocio por pantalla
    │   │   ├── shared/useAsyncData.js
    │   │   ├── public/      ← ViewModels de páginas públicas
    │   │   ├── auth/        ← ViewModels de autenticación
    │   │   └── admin/       ← ViewModels del panel admin
    │   └── view/            ← Componentes visuales
    │       ├── components/  ← Componentes reutilizables
    │       │   ├── ui/      ← Componentes base (Button, Card, Input…)
    │       │   └── layout/  ← Layouts (AppLayout, AdminLayout, Header…)
    │       └── pages/       ← Páginas de la aplicación
    │           ├── auth/    ← Login, Registro, RecuperarPassword, NuevaPassword
    │           └── admin/   ← Dashboard, Lugares, Eventos, Reseñas (admin)
    ├── index.html
    ├── vite.config.js
    ├── vercel.json
    ├── .env.local           ← Variables de entorno locales (NO se sube a Git)
    └── .env.example         ← Plantilla de variables de entorno
```

---

## 4. Arquitectura MVVM

El proyecto sigue el patrón **MVVM (Model–View–ViewModel)**:

```
┌─────────────────────────────────────────────────────────┐
│  VIEW  (src/view/)                                      │
│  Componentes React puros — solo muestran datos y        │
│  llaman funciones. No contienen lógica de negocio.      │
│  Ejemplo: LugarDetallePage, ResenasSection, Button      │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
┌──────────────────────▼──────────────────────────────────┐
│  VIEWMODEL  (src/viewmodel/)                            │
│  Hooks personalizados con toda la lógica de la pantalla │
│  (estado, validaciones, llamadas al repo, navegación).  │
│  Ejemplo: useResenasViewModel, useLoginViewModel        │
└──────────────────────┬──────────────────────────────────┘
                       │ llama
┌──────────────────────▼──────────────────────────────────┐
│  MODEL  (src/model/)                                    │
│  Acceso a datos. entretecaRepository.js abstrae         │
│  Supabase y el modo mock detrás de funciones puras.     │
│  Ejemplo: listarLugares(), publicarResena()             │
└─────────────────────────────────────────────────────────┘
```

**Ventaja principal:** la View nunca llama a Supabase directamente. Si se cambia la base de datos, solo cambia el Model; la View y el ViewModel no se tocan.

---

## 5. Cómo React se conecta a Supabase

### Paso 1 — Instalar el cliente

```bash
npm install @supabase/supabase-js
```

### Paso 2 — Crear el cliente (`src/core/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js'

const url     = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession:    true,   // guarda la sesión en localStorage
    autoRefreshToken:  true,   // renueva el token antes de que expire
    detectSessionInUrl: true,  // lee tokens del URL (confirmación de email)
  },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
```

- **`import.meta.env`** es la forma de Vite para acceder a variables de entorno. Solo funcionan las que empiezan con `VITE_`.
- **`persistSession: true`** hace que el usuario no tenga que volver a iniciar sesión al recargar la página.
- **`autoRefreshToken: true`** renueva el JWT automáticamente antes de que expire (los tokens duran 1 hora por defecto).
- **`detectSessionInUrl: true`** es necesario para que funcione la confirmación de email y el reset de contraseña (Supabase pone el token en la URL).
- **`isSupabaseConfigured`** es un booleano que indica si las variables están configuradas. Si no lo están, la app funciona en modo demo con datos mock.

### Paso 3 — Usar el cliente en el repositorio

```js
// Ejemplo: listar lugares desde Supabase
export async function listarLugares({ idCategoria, q } = {}) {
  let query = supabase
    .from('lugar')                                           // tabla
    .select('*, categoria:id_categoria (id_categoria, nombre, icono)')  // JOIN
    .order('nombre')                                         // orden

  if (idCategoria) query = query.eq('id_categoria', idCategoria)  // filtro exacto
  if (q) query = query.or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`)  // búsqueda

  return query  // devuelve { data, error }
}
```

Todos los métodos del cliente Supabase devuelven `{ data, error }`. Nunca lanzan excepciones (salvo errores de red).

---

## 6. Autenticación — flujo completo

### Cómo funciona Supabase Auth

Supabase Auth usa **JWT (JSON Web Token)**. Cuando el usuario inicia sesión, Supabase genera dos tokens:
- **access_token**: JWT de corta duración (1 hora). Se envía en cada request a la API.
- **refresh_token**: Token de larga duración. Se usa para obtener un nuevo access_token sin pedir contraseña.

Ambos se guardan en `localStorage` gracias a `persistSession: true`.

### AuthContext — el proveedor global (`src/core/auth/AuthContext.jsx`)

Para que TODA la app sepa si el usuario está autenticado, se usa la **Context API de React**:

```jsx
// 1. Crear el contexto (authContextObject.js)
export const AuthContext = createContext(null)

// 2. Proveedor (AuthContext.jsx) — envuelve toda la app en App.jsx
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // Carga la sesión guardada en localStorage al arrancar
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Escucha cambios en tiempo real (login, logout, refresh token)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  // Cuando el userId cambia, carga el perfil desde la tabla 'usuario'
  const userId = session?.user?.id
  useEffect(() => {
    if (!userId) { setProfile(null); return }
    supabase
      .from('usuario')
      .select('*')
      .eq('id_usuario', userId)
      .maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [userId])

  const value = {
    session,
    user:            session?.user ?? demoUser,
    profile:         profile ?? demoProfile,
    loading,
    isAuthenticated: Boolean(session) || !isSupabaseConfigured,
    isAdmin:         profile?.rol === 'admin',
    isDemo:          !isSupabaseConfigured,
    signUp, signIn, signOut, resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

**¿Por qué `onAuthStateChange`?** Porque varios eventos cambian la sesión de forma asíncrona: el usuario hace login en otra pestaña, el token expira y se renueva automáticamente, el usuario confirma su email. `onAuthStateChange` escucha todos estos eventos y actualiza el estado.

### Hook `useAuth`

```js
// src/core/auth/useAuth.js
import { useContext } from 'react'
import { AuthContext } from './authContextObject'

export function useAuth() {
  return useContext(AuthContext)
}
```

Cualquier componente puede llamar `const { user, isAuthenticated, signOut } = useAuth()` para acceder al estado de autenticación.

### Registro de usuario (`signUp`)

```js
// En AuthContext.jsx
const signUp = useCallback(async ({ email, password, nombre }) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre }  // se guarda en raw_user_meta_data del usuario
    },
  })
}, [])
```

```js
// En useRegistroViewModel.js — validación antes de llamar a Supabase
async function handleSubmit(e) {
  e.preventDefault()
  if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
  if (password !== confirm) { setError('Las contraseñas no coinciden'); return }

  setLoading(true)
  const { data, error } = await signUp({ email, password, nombre })
  setLoading(false)

  if (error) { setError(error.message); return }

  // Si Supabase devuelve sesión inmediata (sin confirmación de email obligatoria)
  if (data?.session) {
    navigate('/', { replace: true })
  } else {
    // Confirmación de email requerida → mostrar pantalla de éxito
    setDone(true)
  }
}
```

### Inicio de sesión (`signIn`)

```js
const signIn = useCallback(async ({ email, password }) => {
  return supabase.auth.signInWithPassword({ email, password })
}, [])
```

`signInWithPassword` verifica las credenciales con el servidor, devuelve `{ data: { session, user }, error }`.

### Cierre de sesión (`signOut`)

```js
const signOut = useCallback(async () => {
  return supabase.auth.signOut()
}, [])
```

Borra los tokens de `localStorage` y notifica a `onAuthStateChange` con `session = null`.

---

## 7. Confirmación de correo electrónico

### ¿Por qué existe?

Verifica que el email pertenece al usuario antes de activar la cuenta. Sin confirmación, cualquiera podría registrarse con el email de otra persona.

### Flujo paso a paso

```
1. Usuario llena el formulario de registro
2. React llama a supabase.auth.signUp(...)
3. Supabase crea el usuario en auth.users con email_confirmed_at = NULL
4. Supabase envía un email automático con un enlace de confirmación
5. El enlace tiene esta forma:
   https://[proyecto].supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://[app].vercel.app
6. El usuario hace clic en el enlace
7. Supabase valida el token y redirige al usuario a la app
8. La URL de la app contiene parámetros de sesión en el fragmento (#):
   https://[app].vercel.app/#access_token=...&refresh_token=...&type=signup
9. El cliente Supabase detecta esto gracias a detectSessionInUrl: true
10. onAuthStateChange se dispara con el evento 'SIGNED_IN' y la nueva sesión
11. El usuario queda autenticado automáticamente
```

### Pantalla de éxito en el registro

```jsx
// RegistroPage muestra esto cuando data.session es null (confirmación requerida)
if (vm.done) {
  return (
    <AuthLayout title="Revisa tu correo">
      <SuccessBanner message="Cuenta creada. Confirma tu correo para activar el ingreso." />
      <Link to="/login">Ir a ingresar</Link>
    </AuthLayout>
  )
}
```

### Configuración en Supabase Dashboard

En `Authentication → Email Templates` se puede personalizar el email que recibe el usuario. En `Authentication → URL Configuration` se configura el `Site URL` (URL de la app en producción) que Supabase usa para los redirects.

---

## 8. Recuperación de contraseña

### Flujo completo

```
1. Usuario va a /recuperar-password y escribe su email
2. React llama a:
   supabase.auth.resetPasswordForEmail(email, {
     redirectTo: 'https://[app].vercel.app/recuperar-password/nueva'
   })
3. Supabase envía un email con un enlace de recuperación
4. El enlace redirige a /recuperar-password/nueva con tokens en la URL
5. detectSessionInUrl: true los detecta y establece una sesión temporal
6. NuevaPasswordPage muestra el formulario de nueva contraseña
7. El usuario escribe y confirma la nueva contraseña
8. React llama a:
   supabase.auth.updateUser({ password: 'nuevaContraseña' })
9. Supabase actualiza la contraseña en auth.users
10. Se redirige al usuario a /login
```

### Código de NuevaPasswordPage

```jsx
// src/view/pages/auth/NuevaPassword.jsx
async function handleSubmit(e) {
  e.preventDefault()
  if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
  if (password !== confirm) { setError('Las contraseñas no coinciden'); return }

  setLoading(true)
  const { error } = await supabase.auth.updateUser({ password })
  setLoading(false)

  if (error) { setError(error.message); return }
  setDone(true)
  setTimeout(() => navigate('/login', { replace: true }), 2500)
}
```

---

## 9. Base de datos — schema completo

### Diagrama de tablas

```
categoria (id_categoria PK, nombre, icono)
    │
    └── lugar (id_lugar UUID PK, id_categoria FK, nombre, descripcion,
    │          direccion, comuna, latitud, longitud, es_gratuito,
    │          precio, horario, imagen_url, wikipedia_slug, created_at)
    │               │
    │               ├── evento (id_evento UUID PK, id_lugar FK, nombre,
    │               │           descripcion, fecha_inicio, fecha_fin,
    │               │           es_gratuito, precio, imagen_url, created_at)
    │               │
    │               └── resena (id_resena UUID PK, id_usuario FK,
    │                           id_lugar FK nullable, id_evento FK nullable,
    │                           titulo, contenido, puntuacion 1-5,
    │                           estado, created_at)
    │                               │
    │                               └── voto_resena (id_voto UUID PK,
    │                                               id_usuario FK, id_resena FK,
    │                                               es_positivo BOOLEAN)
    │
auth.users (gestionada por Supabase)
    │
    └── usuario (id_usuario UUID PK FK→auth.users, nombre, avatar_url,
                 rol: 'usuario'|'admin', created_at)
                     │
                     ├── resena (id_usuario FK)
                     ├── voto_resena (id_usuario FK)
                     └── favorito (id_favorito UUID PK, id_usuario FK,
                                   id_lugar FK nullable, id_evento FK nullable)
```

### Vista: `resena_con_votos`

Vista SQL que agrega los votos de cada reseña en una sola fila:

```sql
SELECT
  r.*,
  COUNT(v.id_voto) FILTER (WHERE v.es_positivo = true)  AS votos_positivos,
  COUNT(v.id_voto) FILTER (WHERE v.es_positivo = false) AS votos_negativos,
  COUNT(v.id_voto) FILTER (WHERE v.es_positivo = true)
    - COUNT(v.id_voto) FILTER (WHERE v.es_positivo = false) AS score
FROM resena r
LEFT JOIN voto_resena v ON v.id_resena = r.id_resena
GROUP BY r.id_resena;
```

El frontend consulta esta vista en vez de la tabla `resena` para obtener el conteo de votos sin necesidad de hacer JOIN en el cliente.

---

## 10. Row Level Security (RLS)

### ¿Qué es RLS?

Es una característica de PostgreSQL que permite definir **políticas de acceso a nivel de fila**. Cuando RLS está activado en una tabla, cada SELECT/INSERT/UPDATE/DELETE es filtrado según las políticas definidas. Si no hay ninguna política que permita la operación, PostgreSQL la deniega.

Supabase activa RLS en todas las tablas públicas y usa el JWT del usuario para saber quién está haciendo la consulta. La función `auth.uid()` devuelve el UUID del usuario autenticado a partir del JWT.

### Función helper `es_admin()`

```sql
CREATE OR REPLACE FUNCTION public.es_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuario
    WHERE id_usuario = auth.uid() AND rol = 'admin'
  );
$$;
```

- **`STABLE`**: no modifica la base de datos, puede ser cacheada dentro de una transacción.
- **`SECURITY DEFINER`**: se ejecuta con los permisos del creador (superuser), no del llamador. Necesario para que funcione dentro de políticas RLS sin causar recursión infinita.
- **`SET search_path = ''`**: previene ataques de "search path hijacking" donde alguien podría reemplazar funciones en otro schema.

### Políticas implementadas

#### Tabla `lugar` (igual para `categoria` y `evento`)

```sql
-- Cualquiera puede leer
CREATE POLICY lugar_select_public ON lugar
  FOR SELECT USING (true);

-- Solo admin puede crear/modificar/eliminar
CREATE POLICY lugar_admin_insert ON lugar
  FOR INSERT WITH CHECK (es_admin());

CREATE POLICY lugar_admin_update ON lugar
  FOR UPDATE USING (es_admin());

CREATE POLICY lugar_admin_delete ON lugar
  FOR DELETE USING (es_admin());
```

#### Tabla `resena`

```sql
-- Puede verse si es visible, o si es del propio usuario, o si es admin
CREATE POLICY resena_select_visible ON resena
  FOR SELECT USING (
    estado = 'visible'
    OR (SELECT auth.uid()) = id_usuario
    OR es_admin()
  );

-- Solo usuarios autenticados pueden insertar su propia reseña
CREATE POLICY resena_insert_auth ON resena
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id_usuario);
```

#### Tabla `favorito`

```sql
-- Cada usuario solo ve y gestiona sus propios favoritos
CREATE POLICY favorito_select_own ON favorito
  FOR SELECT USING ((SELECT auth.uid()) = id_usuario);

CREATE POLICY favorito_insert_own ON favorito
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id_usuario);

CREATE POLICY favorito_delete_own ON favorito
  FOR DELETE USING ((SELECT auth.uid()) = id_usuario);
```

### `(SELECT auth.uid())` vs `auth.uid()` — diferencia de rendimiento

```sql
-- Malo (PostgreSQL evalúa auth.uid() una vez POR FILA)
USING (auth.uid() = id_usuario)

-- Bueno (PostgreSQL evalúa auth.uid() UNA SOLA VEZ por query)
USING ((SELECT auth.uid()) = id_usuario)
```

Con `(SELECT auth.uid())`, PostgreSQL reconoce que es una subconsulta estable y la evalúa una sola vez para toda la consulta. En tablas con muchas filas, la diferencia de rendimiento es significativa.

---

## 11. Triggers y funciones SQL

### Trigger `on_auth_user_created`

Este es el mecanismo más importante para que el registro funcione. Cuando Supabase crea un usuario en `auth.users`, necesitamos crear automáticamente su fila en `public.usuario`.

```sql
-- La función que se ejecuta
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.usuario (id_usuario, nombre, avatar_url, rol)
  VALUES (
    new.id,
    -- Usa el nombre enviado desde el formulario (raw_user_meta_data)
    -- Si no viene, usa la parte local del email (antes del @)
    COALESCE(new.raw_user_meta_data->>'nombre', SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    -- Por defecto 'usuario'; se puede cambiar a 'admin' desde el dashboard
    COALESCE(new.raw_app_meta_data->>'rol', 'usuario')
  );
  RETURN new;
END;
$$;

-- El trigger que llama a la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**¿Por qué `SECURITY DEFINER`?** Porque la función necesita insertar en `public.usuario` con permisos suficientes, independientemente de quién disparó el trigger.

**`new.raw_user_meta_data`** contiene los datos opcionales enviados en el `signUp`:
```js
supabase.auth.signUp({
  email, password,
  options: { data: { nombre: 'Diego' } }  // ← esto llega como raw_user_meta_data
})
```

### Trigger `set_updated_at`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger LANGUAGE plpgsql
  SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Aplicado a evento y resena
CREATE TRIGGER evento_updated_at
  BEFORE UPDATE ON evento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER resena_updated_at
  BEFORE UPDATE ON resena
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

Actualiza automáticamente la columna `updated_at` cada vez que se modifica una fila, sin que el frontend tenga que preocuparse por enviarlo.

---

## 12. Edge Functions

### ¿Qué son?

Funciones serverless que corren en la infraestructura de Supabase (sobre Deno, no Node.js). Funcionan como un mini backend API: reciben requests HTTP y devuelven JSON. Se usan cuando necesitas la **`service_role` key**, que omite todas las políticas RLS y tiene acceso total a la base de datos.

URL base: `https://uaiecsrhhjkgdzycyejm.supabase.co/functions/v1/`

### Las 3 funciones desplegadas

| Función | Métodos | Propósito |
|---------|---------|-----------|
| `admin-lugares` | GET, POST, PUT, DELETE | CRUD completo de lugares |
| `admin-eventos` | GET, POST, PUT, DELETE | CRUD completo de eventos |
| `admin-resenas` | GET, PATCH | Listar y moderar reseñas |

### Sistema de doble autorización

Cada función tiene **dos capas de seguridad**:

**Capa 1 — JWT verificado por el runtime de Supabase** (`verify_jwt: true`)

Antes de que llegue al código de la función, el runtime verifica que:
- Existe el header `Authorization: Bearer <token>`
- El JWT es válido y no ha expirado
- Fue firmado por el proyecto Supabase correcto

Si falla → `401 Unauthorized` automático, el código ni se ejecuta.

**Capa 2 — Verificación de rol admin en el código**

```typescript
async function verificarAdmin(authHeader: string | null): Promise<boolean> {
  // Usa la anon key + JWT del usuario para identificarlo
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return false

  // Usa service_role para consultar el rol (bypass RLS)
  const db = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data } = await db
    .from('usuario')
    .select('rol')
    .eq('id_usuario', user.id)
    .single()

  return data?.rol === 'admin'
}
```

Si no es admin → `403 Forbidden`.

### Cómo el frontend llama a las Edge Functions (`callAdmin`)

```js
// src/model/entretecaRepository.js
async function callAdmin(fn, method, path = '', body = null) {
  // 1. Obtiene el JWT del usuario desde localStorage
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return { data: null, error: new Error('No autenticado') }

  // 2. Construye la URL de la Edge Function
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}${path}`

  // 3. Hace el fetch con el JWT en el header
  let res
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { data: null, error: new Error('Error de red') }
  }

  // 4. Parsea la respuesta
  let json
  try { json = await res.json() } catch { json = {} }
  if (!res.ok) return { data: null, error: new Error(json.error ?? 'Error en Edge Function') }
  return { data: json, error: null }
}
```

### Variables de entorno en Edge Functions

Estas variables se inyectan automáticamente, no es necesario configurarlas:

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_ANON_KEY` | Clave pública (respeta RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada (bypass RLS) — **NUNCA exponerla al frontend** |

---

## 13. Componentes React complejos

### `AuthContext` — Context API

Context API de React es el mecanismo para compartir estado global sin pasar props por cada nivel de la jerarquía de componentes (problema llamado "prop drilling").

```
App
└── AuthProvider          ← provee el contexto
    └── BrowserRouter
        └── Header         ← consume con useAuth()
        └── ProtectedRoute ← consume con useAuth()
        └── PerfilPage     ← consume con useAuth()
        └── AdminLayout    ← consume con useAuth()
```

Sin Context, cada componente que necesitara el estado del usuario recibiría `user`, `isAuthenticated`, etc. como props pasadas desde `App` a través de todos los niveles intermedios.

### `useAsyncData` — Patrón de carga de datos

Hook compartido que envuelve cualquier función async que devuelva `{ data, error }`:

```js
export function useAsyncData(fn, trigger = 0) {
  const [result, setResult] = useState({ data: null, error: null, fn: null, trigger: null })

  useEffect(() => {
    let cancelled = false
    fn().then((res) => {
      if (cancelled) return  // evita actualizar estado si el componente ya se desmontó
      setResult({ data: res?.data ?? null, error: res?.error ?? null, fn, trigger })
    })
    return () => { cancelled = true }  // cleanup: cancela si el componente se desmonta
  }, [fn, trigger])

  // "loading" se DERIVA en render, no es un estado separado
  // Es true mientras el resultado guardado no corresponda a la fn/trigger actuales
  const loading = result.fn !== fn || result.trigger !== trigger
  return { data: result.data, error: result.error, loading }
}
```

**Puntos clave:**
- `fn` debe ser **estable** (envuelta en `useCallback`) o cambiará en cada render, causando un bucle infinito.
- `trigger` es un número que se puede incrementar para forzar una recarga (usado en el admin después de crear/editar/eliminar).
- `loading` es **derivado** (se calcula en render, no con `useState`) para evitar el problema de "flash of loading" entre recargas.
- La variable `cancelled` evita actualizar el estado si el componente se desmontó mientras se esperaba la respuesta.

**Uso típico:**
```js
const cargarLugares = useCallback(() => listarLugares(), [])
const { data: lugares, loading, error } = useAsyncData(cargarLugares)
```

### `ProtectedRoute` — Rutas protegidas

```jsx
export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  // Mientras carga la sesión, no redirigir todavía (evita flash de login)
  if (loading) {
    return <div>Cargando…</div>
  }

  // Usuario no autenticado → redirige a login guardando la ruta de origen
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Ruta solo para admins y el usuario no es admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
```

El `state={{ from: location.pathname }}` guarda la ruta que el usuario intentaba visitar. Después del login exitoso, el ViewModel lo recupera y redirige allí:

```js
// useLoginViewModel.js
const from = location.state?.from ?? '/'
// ... tras login exitoso:
navigate(from, { replace: true })
```

### `ResenasSection` — Reseñas y votación

Componente que combina: lista de reseñas, promedio de estrellas, formulario de nueva reseña y sistema de votación.

```
ResenasSection
├── useResenasViewModel  ← toda la lógica (carga, publicar, votar)
├── Estrellas            ← promedio visual
├── Button               ← toggle del formulario (solo si autenticado)
├── ResenaForm           ← formulario para escribir nueva reseña
└── ResenaCard[]         ← cada reseña con botones de voto
    ├── Avatar con fallback a DiceBear
    ├── Fecha relativa ("Hace 3 días")
    ├── Estrellas
    └── Botones thumb_up / thumb_down (resaltados si el usuario ya votó)
```

**Estado de votación derivado:**
```js
// El voto del usuario actual para cada reseña se guarda en un Map
const votoPorResena = useMemo(() => {
  const map = new Map()
  votos.forEach((voto) => map.set(voto.id_resena, voto))
  return map
}, [votos])

// En ResenaCard: votoUsuario?.es_positivo === true → botón azul
//               votoUsuario?.es_positivo === false → botón rojo
//               votoUsuario === undefined → botón gris
```

### `Mapa` — react-leaflet v5

```
Mapa (lazy loaded)
├── MapContainer        ← inicializa el mapa con centro y zoom
├── ControladorVista    ← hook useMap() para actualizar vista dinámicamente
├── TileLayer           ← carga los tiles de OpenStreetMap
└── Marker[]            ← un marcador por punto válido
    ├── icon: L.divIcon ← SVG personalizado (azul=lugar, cian=evento)
    └── Popup           ← popup con nombre, comuna y link al detalle
```

**Por qué `L.divIcon` en vez del marcador por defecto de Leaflet:**  
El marcador por defecto de Leaflet usa archivos de imagen (`marker-icon.png`). Con bundlers (Vite, Webpack) las rutas de estos archivos se rompen porque el bundler mueve los assets. `L.divIcon` con SVG inline evita completamente este problema.

**`ControladorVista` — el patrón useMap():**
```jsx
function ControladorVista({ lat, lng, zoom }) {
  const map = useMap()  // solo funciona dentro de MapContainer
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true })
  }, [map, lat, lng, zoom])  // primitivos → comparación correcta por valor
  return null
}
```

`useMap()` es un hook de react-leaflet que da acceso a la instancia del mapa de Leaflet. No existe fuera del árbol de `MapContainer`.

### `Button` — CVA (Class Variance Authority)

```jsx
const buttonVariants = cva(
  // clases base aplicadas siempre
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-on-primary',
        secondary:   'bg-secondary text-white',
        outline:     'border border-outline-variant bg-white',
        destructive: 'bg-error text-on-error',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

export function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

CVA permite definir todas las variantes de un componente en un solo lugar. Al llamar `<Button variant="secondary" size="lg">`, CVA automáticamente selecciona las clases correctas.

### `entretecaRepository.js` — Facade pattern

El repositorio actúa como una **fachada** (Facade): expone una interfaz unificada (`listarLugares`, `publicarResena`, etc.) y oculta si los datos vienen de Supabase o del mock.

```js
export async function listarLugares(filtros = {}) {
  if (!isSupabaseConfigured) {
    // Modo demo: filtra el array local
    return { data: lugaresState.filter(...), error: null }
  }
  // Modo producción: consulta Supabase
  return supabase.from('lugar').select('*').order('nombre')
}
```

---

## 14. Routing y rutas protegidas

### React Router DOM v7

El enrutamiento es client-side: no hay navegación real al servidor. Al cambiar de ruta, React Router swapea el componente renderizado sin recargar la página.

```jsx
// App.jsx — estructura completa de rutas
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Rutas públicas dentro del layout con Header y Footer */}
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="lugares" element={<LugaresPage />} />
              <Route path="lugares/:id" element={<LugarDetallePage />} />  {/* ruta dinámica */}
              <Route path="login" element={<LoginPage />} />               {/* lazy */}
              <Route path="recuperar-password/nueva" element={<NuevaPasswordPage />} />

              {/* Rutas protegidas — redirigen a /login si no autenticado */}
              <Route path="favoritos" element={
                <ProtectedRoute><FavoritosPage /></ProtectedRoute>
              } />
            </Route>

            {/* Panel admin — layout diferente, protegido + solo admin */}
            <Route path="admin" element={
              <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<AdminDashboardPage />} />
              <Route path="lugares" element={<AdminLugaresPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### Lazy Loading

Las rutas de auth y admin se cargan de forma perezosa (solo cuando el usuario las visita):

```js
const LoginPage = lazy(() =>
  import('@/view/pages/auth/Login').then((m) => ({ default: m.LoginPage }))
)
```

`lazy()` + `Suspense` hacen que el código de cada sección se descargue en un chunk separado, reduciendo el tamaño del bundle inicial.

### `vercel.json` — Fix para SPA en Vercel

Sin esta configuración, refrescar la página en `/lugares/123` devuelve un 404 porque Vercel busca un archivo físico en esa ruta (no existe).

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Esta regla redirige TODA petición a `index.html`, y React Router se encarga de renderizar el componente correcto según la URL.

---

## 15. Variables de entorno

### ¿Por qué son necesarias?

Las credenciales de Supabase no deben estar hardcodeadas en el código fuente. Si el código está en GitHub (público o privado), las credenciales estarían expuestas. Las variables de entorno permiten que el código sea el mismo en todos los entornos, pero con valores diferentes.

### Convención de Vite

Solo las variables que empiezan con `VITE_` son accesibles desde el código del cliente:

```
VITE_SUPABASE_URL=https://xxx.supabase.co    → accesible
SUPABASE_SECRET=abc123                        → NO accesible (queda en el servidor)
```

Se acceden con `import.meta.env.VITE_NOMBRE_VARIABLE`.

### Archivos de entorno

| Archivo | Propósito | Se sube a Git |
|---------|-----------|---------------|
| `.env.example` | Plantilla con las variables requeridas (sin valores) | ✅ Sí |
| `.env.local` | Valores reales para desarrollo local | ❌ No (en .gitignore) |

### Contenido de `.env.local`

```bash
VITE_SUPABASE_URL=https://uaiecsrhhjkgdzycyejm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

La `ANON_KEY` es **pública por diseño** en Supabase. No es un secreto. La seguridad de los datos está garantizada por las políticas RLS, no por ocultar esta clave.

---

## 16. Despliegue en Vercel

### ¿Qué es Vercel?

Plataforma de hosting especializada en aplicaciones frontend (Next.js, React, Vite). Detecta automáticamente el framework, instala dependencias, construye y despliega.

### Proceso de despliegue

```
1. git push a la rama main
2. Vercel detecta el push automáticamente
3. npm install  → instala dependencias
4. npm run build → vite build → genera /dist
5. Vercel sirve /dist como CDN global
6. La app está disponible en https://[nombre].vercel.app
```

### Configurar variables de entorno en Vercel

En el Dashboard de Vercel → Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL    = https://uaiecsrhhjkgdzycyejm.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante:** sin estas variables, el proyecto desplegado funcionará en modo demo (sin datos reales de Supabase).

### Build de producción: qué genera `npm run build`

```
dist/
├── index.html                   ← entry point
├── assets/
│   ├── index-[hash].js          ← bundle principal (~242KB gzip: 71KB)
│   ├── supabase-[hash].js       ← librería Supabase (~200KB gzip: 51KB)
│   ├── Mapa-[hash].js           ← Leaflet + react-leaflet (~155KB gzip: 46KB)
│   ├── Mapa-[hash].css          ← CSS de Leaflet (~15KB gzip: 6KB)
│   ├── Login-[hash].js          ← chunk lazy de login (~2KB)
│   ├── Registro-[hash].js       ← chunk lazy de registro (~3KB)
│   ├── AdminLugares-[hash].js   ← chunk lazy admin (~10KB)
│   └── hero-santiago-[hash].webp← imagen del hero (~652KB)
```

Los chunks lazy (Login, Admin, Mapa) solo se descargan cuando el usuario navega a esa sección, haciendo la carga inicial más rápida.

---

## 17. Modo demo (sin Supabase)

Si `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` no están configuradas, `isSupabaseConfigured = false` y la app entra en modo demo:

- Todos los datos vienen de arrays en memoria (`mockData.js`)
- El usuario demo es `{ id: 'u-demo', email: 'demo@entreteca.cl', rol: 'admin' }`
- El CRUD del admin funciona (modifica los arrays en memoria)
- Las reseñas y votos se guardan en memoria (se pierden al recargar)
- El Header muestra el badge "Modo demo"

Esto permite desarrollar y testear la interfaz sin necesidad de conexión a internet ni a Supabase.

---

## 18. Glosario

| Término | Definición |
|---------|------------|
| **JWT** | JSON Web Token. Token codificado que contiene información del usuario (id, email, rol). Se envía en cada request para autenticarse. |
| **RLS** | Row Level Security. Políticas de PostgreSQL que filtran qué filas puede ver/modificar cada usuario. |
| **ANON KEY** | Clave pública de Supabase. Se puede exponer en el frontend. La seguridad la garantiza RLS. |
| **SERVICE ROLE KEY** | Clave secreta de Supabase. Omite RLS, acceso total. Solo debe usarse en el servidor. |
| **Edge Function** | Función serverless que corre en Deno en los servidores de Supabase. Actúa como backend API. |
| **SPA** | Single Page Application. La app carga una vez y navega sin recargar el navegador. |
| **Lazy Loading** | Técnica para cargar código JavaScript solo cuando se necesita, reduciendo el bundle inicial. |
| **MVVM** | Model-View-ViewModel. Patrón de arquitectura que separa datos, lógica y presentación. |
| **Hook** | Función de React que empieza por `use`. Permite usar estado y efectos en componentes funcionales. |
| **Context API** | Sistema de React para compartir estado global sin pasar props a través de cada nivel. |
| **CVA** | Class Variance Authority. Librería para manejar variantes de componentes con Tailwind. |
| **Vite** | Bundler moderno que usa ES modules nativo. Mucho más rápido que Webpack. |
| **Bundle** | Archivo JavaScript único que Vite genera juntando todo el código del proyecto. |
| **Trigger** | En PostgreSQL, una función que se ejecuta automáticamente ante un evento (INSERT, UPDATE, DELETE). |
| **FK** | Foreign Key. Columna que referencia la clave primaria de otra tabla, garantizando integridad referencial. |
| **UUID** | Identificador único universal. Formato: `550e8400-e29b-41d4-a716-446655440000`. Más seguro que IDs numéricos secuenciales. |
| **react-leaflet** | Wrapper de React para la librería de mapas Leaflet. Usa componentes React en vez de la API imperativa de Leaflet. |
| **OpenStreetMap** | Mapa colaborativo y gratuito. Alternativa sin costo a Google Maps. |
