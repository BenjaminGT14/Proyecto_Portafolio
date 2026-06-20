# Documentación Completa — Entreteca

> Proyecto Final · Duoc UC 2026
> **Frontend:** React 19 · Vite 8 · Tailwind CSS v4
> **Backend propio:** Spring Boot 3.5 · MySQL 8 · JWT
>
> Para el detalle técnico profundo del backend y de la migración desde Supabase,
> ver [arquitectura-backend-springboot.md](arquitectura-backend-springboot.md).
> Convenciones de trabajo del repo: ver [CLAUDE.md](../CLAUDE.md) en la raíz.

---

## Índice

1. [¿Qué es Entreteca?](#1-qué-es-entreteca)
2. [Arquitectura general](#2-arquitectura-general)
3. [Herramientas y por qué se eligieron](#3-herramientas-y-por-qué-se-eligieron)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Frontend — Arquitectura MVVM](#5-frontend--arquitectura-mvvm)
6. [Cómo el frontend habla con el backend (`api.js`)](#6-cómo-el-frontend-habla-con-el-backend-apijs)
7. [Autenticación — flujo completo (JWT)](#7-autenticación--flujo-completo-jwt)
8. [Recuperación de contraseña](#8-recuperación-de-contraseña)
9. [Modelo de datos](#9-modelo-de-datos)
10. [API REST — endpoints](#10-api-rest--endpoints)
11. [Seguridad del backend](#11-seguridad-del-backend)
12. [Componentes React destacados](#12-componentes-react-destacados)
13. [Routing y rutas protegidas](#13-routing-y-rutas-protegidas)
14. [Variables de entorno](#14-variables-de-entorno)
15. [Testing](#15-testing)
16. [Cómo ejecutar el proyecto](#16-cómo-ejecutar-el-proyecto)
17. [Despliegue](#17-despliegue)
18. [Glosario](#18-glosario)

---

## 1. ¿Qué es Entreteca?

Entreteca es una plataforma web para descubrir lugares, eventos culturales y actividades en Santiago de Chile. Los usuarios pueden:

- Explorar lugares y eventos con filtros (categoría, comuna, costo, búsqueda, fecha)
- Ver un mapa interactivo con todos los puntos georeferenciados
- Escribir reseñas con puntuación de 1 a 5 estrellas y votar las reseñas de otros
- Guardar favoritos (lugares y eventos)
- **Proponer eventos**, que quedan pendientes de aprobación de un administrador
- Administrar el contenido desde un panel de administración (solo rol `admin`)

> **Nota de nombres:** el producto (frontend) se llama **Entreteca**; el backend
> es el módulo **eventout-backend** y su base de datos es `eventout_db`. Son el
> mismo proyecto.

---

## 2. Arquitectura general

El sistema tiene dos piezas que se comunican por **REST/JSON** con autenticación **JWT**:

```
┌────────────┐    HTTP/JSON (REST)        ┌──────────────────────┐     JPA/Hibernate    ┌──────────┐
│  Frontend  │  ───────────────────────►  │  Backend Spring Boot  │  ────────────────►   │  MySQL   │
│  (React)   │  ◄── JWT + { data } ─────── │  controller→service   │                      │ eventout │
│   :5173    │                            │   →repository→model    │                      │   _db    │
└────────────┘                            └──────────────────────┘                      └──────────┘
```

- El **frontend** no contiene lógica de datos: pide y muestra. Todas las llamadas pasan por un único cliente REST (`src/core/api.js`).
- El **backend** centraliza la lógica de negocio, la seguridad y la persistencia en capas clásicas (Controller → Service → Repository → Model).
- El contrato entre ambos es siempre `{ data, error }` (lo veremos en la sección 6).

---

## 3. Herramientas y por qué se eligieron

### Frontend (`Producto/frontend`)

| Herramienta | Versión | ¿Para qué sirve? |
|-------------|---------|------------------|
| **React** | 19 | Librería de UI basada en componentes |
| **Vite** | 8 | Bundler y servidor de desarrollo (muy rápido) |
| **React Router DOM** | 7 | Enrutamiento client-side (SPA) |
| **Tailwind CSS** | v4 | Estilos utilitarios (config CSS-first) |
| **class-variance-authority (CVA)** | 0.7 | Variantes de componentes UI (ej. Button) |
| **clsx + tailwind-merge** | — | Combinar clases condicionalmente sin conflictos |
| **lucide-react** | 1.16 | Íconos SVG |
| **react-leaflet + leaflet** | 5 / 1.9 | Mapa interactivo sobre OpenStreetMap (sin API key) |
| **Vitest + Testing Library + jsdom** | 4 / 16 / 29 | Pruebas unitarias y de componentes |

### Backend (`Producto/backend/eventout-backend`)

| Herramienta | ¿Para qué sirve? |
|-------------|------------------|
| **Java 21 + Spring Boot 3.5** | Framework del backend (Web, Data JPA, Security, Validation, Mail) |
| **MySQL 8** | Base de datos relacional (`eventout_db`) |
| **Hibernate (JPA)** | ORM: mapea entidades Java ↔ tablas |
| **JWT (JJWT 0.12)** | Autenticación stateless por token |
| **BCrypt** | Cifrado de contraseñas |
| **springdoc-openapi (Swagger UI)** | Documentación interactiva de la API |
| **Lombok** | Reduce código repetitivo (getters/setters/builder) |

### Herramientas de desarrollo

| Herramienta | Uso |
|-------------|-----|
| **ESLint** | Análisis estático del frontend |
| **Maven (mvnw)** | Build del backend |
| **Git + GitHub** | Control de versiones |

---

## 4. Estructura del proyecto

```
Proyecto_Portafolio/
├── CLAUDE.md                 ← Convenciones del repo
├── Documentacion/            ← Esta carpeta
│   ├── documentacion-completa.md         (este archivo)
│   ├── arquitectura-backend-springboot.md (detalle del backend)
│   ├── Documentacion.txt
│   └── Diagramas_EventOut.pdf
└── Producto/
    ├── frontend/             ← React (Vite)
    │   ├── src/
    │   │   ├── core/         ← api.js (cliente REST), utils.js, auth/
    │   │   ├── model/        ← entretecaRepository.js, mockData.js
    │   │   ├── viewmodel/    ← hooks de lógica por pantalla (public/auth/admin)
    │   │   ├── view/         ← components/ (ui, layout) y pages/
    │   │   └── test/         ← TODAS las pruebas, planas aquí (ver §15)
    │   ├── .env.example      ← VITE_API_URL
    │   ├── vite.config.js / vitest.config.js
    │   └── vercel.json
    └── backend/eventout-backend/   ← Spring Boot (Maven)
        ├── src/main/java/.../eventout_backend/
        │   ├── config/       ← SecurityConfig, OpenApiConfig, DataInitializer
        │   ├── model/        ← entidades JPA + enums/
        │   ├── repository/   ← interfaces Spring Data JPA
        │   ├── dto/          ← objetos de transporte (+ request/ con validación)
        │   ├── mapper/       ← DtoMapper (entidad → DTO)
        │   ├── service/      ← lógica de negocio
        │   ├── security/     ← JwtService, JwtAuthenticationFilter, AuthUser
        │   ├── controller/   ← endpoints REST (+ admin/)
        │   └── exception/    ← GlobalExceptionHandler → JSON { "error": ... }
        └── src/main/resources/application.properties
```

---

## 5. Frontend — Arquitectura MVVM

El frontend sigue **MVVM (Model–View–ViewModel)**:

```
┌──────────────────────────────────────────────────────────┐
│  VIEW  (src/view/)                                        │
│  Componentes React puros: muestran datos y llaman         │
│  funciones. Sin lógica de negocio.                        │
└──────────────────────┬───────────────────────────────────┘
                       │ usa
┌──────────────────────▼───────────────────────────────────┐
│  VIEWMODEL  (src/viewmodel/)                              │
│  Hooks con la lógica de cada pantalla (estado,            │
│  validaciones, llamadas al repo, navegación).             │
└──────────────────────┬───────────────────────────────────┘
                       │ llama
┌──────────────────────▼───────────────────────────────────┐
│  MODEL  (src/model/entretecaRepository.js)               │
│  Acceso a datos. Llama al backend vía api.js y expone     │
│  funciones puras: listarLugares(), publicarResena()…      │
└──────────────────────────────────────────────────────────┘
```

**Ventaja:** la View nunca llama al backend directamente. Cuando se migró de
Supabase a Spring Boot, **solo cambiaron `api.js` y el repositorio**; los
viewmodels y componentes quedaron intactos porque se respetó el contrato `{ data, error }`.

---

## 6. Cómo el frontend habla con el backend (`api.js`)

Todo el tráfico pasa por [src/core/api.js](../Producto/frontend/src/core/api.js):

```js
const API_URL  = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const TOKEN_KEY = 'eventout_token'   // el JWT se guarda en localStorage

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  // ...fetch, manejo de 204 y de !res.ok...
  // Devuelve SIEMPRE { data, error }
}
```

Puntos clave:

- **Contrato uniforme `{ data, error }`.** Nunca lanza excepciones: un fallo de
  red o un `4xx/5xx` se devuelven como `error` (un `Error` con el mensaje del
  backend, que responde `{ "error": "..." }`).
- **`204 No Content` → `{ data: null, error: null }`** (ej. un DELETE).
- **Token JWT** en `localStorage` bajo la clave `eventout_token`; se adjunta como
  `Authorization: Bearer <token>` si existe.
- **`buildQuery(params)`** arma el querystring omitiendo valores vacíos y uniendo
  arrays por coma (ej. `idsResenas=a,b`).

El repositorio [entretecaRepository.js](../Producto/frontend/src/model/entretecaRepository.js)
envuelve `apiFetch` con las firmas que esperan los viewmodels y añade validaciones
locales (regla XOR lugar/evento, exigir sesión, enums de estado). Detalles que
preserva del contrato anterior:

- Los **cuerpos se envían en snake_case** (`id_lugar`, `es_positivo`…) porque
  Jackson en el backend usa `SNAKE_CASE`.
- `obtenerEstadoFavoritos` devuelve **Sets** (`data.lugares.has(id)`) aunque el
  backend responda arrays; la conversión se hace en el repositorio.

---

## 7. Autenticación — flujo completo (JWT)

La autenticación vive en [AuthContext.jsx](../Producto/frontend/src/core/auth/AuthContext.jsx)
(Context API de React) y usa los endpoints `/auth/*` del backend.

```
1. El usuario hace login/registro → POST /auth/login | /auth/register
2. El backend valida (BCrypt) y responde { token, usuario }
3. El frontend guarda el token (localStorage) y el perfil en el contexto
4. Cada request siguiente lleva Authorization: Bearer <token>
5. Al recargar la página: si hay token, se valida con GET /auth/me
   - válido   → se restaura el perfil
   - inválido → se borra el token (sesión caída)
```

El contexto expone:

```js
const value = {
  user,                               // { id, email } derivado del perfil
  profile,                            // UsuarioDto del backend
  loading,                            // true mientras valida /auth/me al arrancar
  isAuthenticated: Boolean(profile),
  isAdmin: profile?.rol === 'admin',
  isDemo: false,                      // el modo demo quedó retirado (ver nota)
  signUp, signIn, signOut, resetPassword, nuevaPassword,
}
```

- **`signUp`** hace auto-login: tras `/auth/register` guarda el token y navega al home.
- **`signOut`** simplemente borra el token y el perfil (stateless: no hay endpoint de logout).
- **`isAdmin`** se deriva del `rol` del perfil; las rutas `/admin` lo exigen (ver §13).

> **Nota — modo demo retirado.** La versión Supabase tenía un "modo demo" sin
> backend (`isDemo`). Hoy `isDemo` es siempre `false` y la app requiere el backend
> corriendo. Quedan restos de UI de demo en `Header.jsx` y `Perfil.jsx` que ya no
> se activan (código muerto, pendiente de limpiar).

---

## 8. Recuperación de contraseña

Flujo en dos pasos, contra `/auth/recuperar-password` y `/auth/nueva-password`:

```
1. El usuario pide recuperar su clave (escribe su email)
   → POST /auth/recuperar-password
   → el backend crea un PasswordResetToken de un solo uso (expira en 1 h)
     y envía un correo con el enlace:
        <frontend>/recuperar-password/nueva?token=...
2. El usuario abre el enlace → NuevaPasswordPage lee ?token= de la URL
3. Escribe la nueva contraseña → POST /auth/nueva-password { token, password }
4. El backend valida el token (no usado, no expirado) y actualiza la clave
```

Por privacidad, `/auth/recuperar-password` siempre responde el mismo mensaje
("Si el email existe, enviamos un enlace de recuperación"), exista o no la cuenta.

> **En desarrollo:** si el SMTP no está configurado, el backend **no falla**:
> escribe el enlace de recuperación en su log, de modo que el flujo se puede
> probar igual.

---

## 9. Modelo de datos

Las entidades JPA (`src/main/java/.../model`) generan las tablas vía Hibernate
(`ddl-auto=update`). Las PK tipo UUID se guardan como `VARCHAR(36)`; `categoria`
usa una PK de texto (ej. `cat-parque`).

| Entidad | Tabla | Campos clave | Relaciones |
|---------|-------|--------------|------------|
| `Categoria` | categoria | id (texto), nombre, icono | — |
| `Lugar` | lugar | id, nombre, descripcion, direccion, comuna, latitud, longitud, es_gratuito, precio, horario, imagen_url, wikipedia_slug, created_at | `@ManyToOne` → Categoria |
| `Evento` | evento | id, nombre, descripcion, fecha_inicio, fecha_fin, es_gratuito, precio, imagen_url, **estado**, created_at | `@ManyToOne` → Lugar; `@ManyToOne` → Usuario (`propuestoPor`, nullable) |
| `Usuario` | usuario | id, email (único), password_hash (`@JsonIgnore`), nombre, avatar_url, rol, created_at | — |
| `Resena` | resena | id, titulo, contenido, puntuacion (1–5), estado, created_at | `@ManyToOne` → Usuario (obligatorio); Lugar **XOR** Evento |
| `VotoResena` | voto_resena | id, es_positivo | `@ManyToOne` → Usuario, Resena (único por usuario+reseña) |
| `Favorito` | favorito | id | `@ManyToOne` → Usuario; Lugar **XOR** Evento |
| `PasswordResetToken` | password_reset_token | token, expires_at, used | `@ManyToOne` → Usuario |

### Enums (se serializan en minúsculas para el frontend)

- **`Rol`**: `USER`, `ADMIN` → JSON `"user"` / `"admin"` (por eso `profile.rol === 'admin'`).
- **`EstadoResena`**: `VISIBLE`, `OCULTA`, `ELIMINADA`.
- **`EstadoEvento`**: `PENDIENTE`, `APROBADO`, `RECHAZADO`.

### Regla "XOR" (lugar o evento)

Reseñas y favoritos apuntan a **exactamente uno**: un lugar *o* un evento, nunca
ambos ni ninguno. Se valida en el **service** del backend y también en el
repositorio del frontend antes de enviar.

### Conteo de votos

Lo que en Supabase era la vista `resena_con_votos` ahora lo calcula el
`ResenaService`: agrega `votos_positivos`, `votos_negativos` y `score`
(positivos − negativos) al devolver las reseñas.

### Datos sembrados (`DataInitializer`)

La primera vez que la BD está vacía se cargan los mismos datos que el frontend
usaba como mock (6 categorías, 8 lugares, 5 eventos, 6 reseñas, 9 votos) y estos
usuarios de prueba (contraseñas cifradas con BCrypt):

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@eventout.cl` | `admin1234` | admin |
| `andrea@eventout.cl`, `ricardo@…`, `elena@…`, `matias@…`, `camila@…` | `demo1234` | user |

---

## 10. API REST — endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/auth/register` | público | Crear cuenta (auto-login: devuelve token) |
| POST | `/auth/login` | público | Iniciar sesión → `{ token, usuario }` |
| GET | `/auth/me` | autenticado | Perfil del usuario del token |
| POST | `/auth/recuperar-password` | público | Envía correo con enlace de reset |
| POST | `/auth/nueva-password` | público | Cambia la clave usando el token del correo |
| GET | `/categorias` | público | Lista de categorías |
| GET | `/lugares` | público | Lista con filtros `idCategoria, comuna, costo, q` |
| GET | `/lugares/{id}` | público | Detalle de un lugar |
| GET | `/eventos` | público | Lista (solo aprobados) con filtros `comuna, costo, q, desde` |
| GET | `/eventos/{id}` | público | Detalle de un evento |
| POST | `/eventos/propuestas` | autenticado | Proponer un evento (queda PENDIENTE) |
| GET | `/resenas?idLugar=..` ó `?idEvento=..` | público | Reseñas visibles + conteo de votos |
| POST | `/resenas` | autenticado | Publicar reseña (autor tomado del token) |
| POST | `/votos` | autenticado | Votar una reseña |
| GET | `/votos?idsResenas=a,b` | autenticado | Votos del usuario sobre esas reseñas |
| GET | `/favoritos` | autenticado | Lugares y eventos favoritos del usuario |
| GET | `/favoritos/estado?idLugares=..&idEventos=..` | autenticado | Cuáles son favoritos |
| POST | `/favoritos/toggle` | autenticado | Agregar/quitar favorito |
| POST/PUT/DELETE | `/admin/lugares[/{id}]` | admin | CRUD de lugares |
| POST/PUT/DELETE | `/admin/eventos[/{id}]` | admin | CRUD de eventos |
| GET | `/admin/eventos?estado=pendiente` | admin | Listar eventos (filtra propuestas) |
| PATCH | `/admin/eventos/{id}/estado` | admin | Aprobar/rechazar una propuesta |
| GET | `/admin/resenas` | admin | Todas las reseñas (moderación) |
| PATCH | `/admin/resenas/{id}` | admin | Cambiar estado (visible/oculta/eliminada) |

**Swagger UI:** `http://localhost:8080/swagger-ui.html` (con botón *Authorize* para pegar el JWT).

---

## 11. Seguridad del backend

Definida en [SecurityConfig.java](../Producto/backend/eventout-backend/src/main/java/com/proyectoPortafolio/eventout_backend/config/SecurityConfig.java):

- **Stateless** (`SessionCreationPolicy.STATELESS`): no hay sesión en servidor; cada request se autentica por su JWT.
- **`JwtAuthenticationFilter`** intercepta cada petición, valida firma/expiración del token y coloca un `AuthUser` (id, email, rol) en el contexto.
- **Contraseñas con BCrypt** (nunca en texto plano).
- **Reglas de acceso:**

| Tipo | Rutas |
|------|-------|
| Público | `POST /auth/{register,login,recuperar-password,nueva-password}`; `GET` de `/categorias`, `/lugares`, `/eventos`, `/resenas`; Swagger |
| Autenticado | todo lo demás (`POST /resenas`, `/votos`, `/favoritos/**`, `/eventos/propuestas`, `GET /auth/me`…) |
| Solo admin (`ROLE_ADMIN`) | `/admin/**` |

- **Errores en JSON** con el mismo formato que el resto: `401 {"error":"No autenticado"}`, `403 {"error":"Acceso denegado"}`. El `GlobalExceptionHandler` traduce el resto (`404`, `400`, `409`, `500`).
- **CORS** habilitado para el frontend (`http://localhost:5173`, `:3000` y `app.frontend.url`).

---

## 12. Componentes React destacados

Todos viven en `src/view/` y son agnósticos del backend (no cambiaron en la migración).

- **`ui/Button`** — usa **CVA** para sus variantes (`variant`, `size`) en un solo lugar; las clases se combinan con `cn()` (clsx + tailwind-merge). Ver [Button.jsx](../Producto/frontend/src/view/components/ui/Button.jsx).
- **`viewmodel/shared/useAsyncData`** — hook que envuelve cualquier función `async` que devuelva `{ data, error }`. Deriva `loading` en render (sin estado extra) y acepta un `trigger` numérico para forzar recargas (usado en el admin tras crear/editar/eliminar).
- **`layout/ProtectedRoute`** — redirige a `/login` si no hay sesión; con `adminOnly`, redirige al home si el usuario no es admin. Mientras `loading`, no redirige (evita el "flash" de login).
- **`ResenasSection`** — combina lista de reseñas, promedio de estrellas, formulario de nueva reseña y votación (thumb up/down resaltado según el voto del usuario).
- **`Mapa` / `MapaLazy`** — `react-leaflet` v5 sobre OpenStreetMap; se carga de forma perezosa. Usa `L.divIcon` con SVG inline para evitar el problema de rutas de assets de Leaflet con bundlers.
- **`EventoFormFields`** — campos del formulario de evento compartidos entre el alta del admin y la página pública de propuesta de eventos.

---

## 13. Routing y rutas protegidas

Definido en [App.jsx](../Producto/frontend/src/App.jsx) con React Router v7 (SPA).

```
/ (AppLayout: Header + Footer)
├── /                       HomePage
├── /lugares                LugaresPage
├── /lugares/:id            LugarDetallePage
├── /eventos                EventosPage
├── /eventos/proponer       ProponerEventoPage   (protegida)
├── /eventos/:id            EventoDetallePage
├── /mapa                   MapaPage
├── /login /registro        (lazy)
├── /recuperar-password     /recuperar-password/nueva   (lazy)
├── /favoritos              FavoritosPage        (protegida)
├── /perfil                 PerfilPage           (protegida)
└── *                       NotFoundPage

/admin  (ProtectedRoute adminOnly + AdminLayout)
├── /admin                  AdminDashboardPage
├── /admin/lugares          AdminLugaresPage
├── /admin/eventos          AdminEventosPage
└── /admin/resenas          AdminResenasPage
```

- **Lazy loading:** las páginas de **auth** y **admin** se cargan en chunks aparte (`lazy()` + `<Suspense>`), reduciendo el bundle inicial.
- **`vercel.json`** reescribe toda ruta a `/index.html` para que el refresco de una URL profunda (ej. `/lugares/123`) no devuelva 404 en producción.

---

## 14. Variables de entorno

### Frontend

Solo las variables con prefijo `VITE_` son accesibles desde el cliente
(`import.meta.env.VITE_*`).

| Variable | Default | Uso |
|----------|---------|-----|
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend |

Plantilla en [.env.example](../Producto/frontend/.env.example). El `.env.local`
(no se versiona) sobre-escribe el valor.

### Backend (`application.properties`, sobre-escribibles por env)

| Variable | Default | Uso |
|----------|---------|-----|
| Datasource MySQL | `eventout_db` en `localhost:3306` (se crea sola) | Conexión a la BD |
| `JWT_SECRET` | clave de desarrollo | Firma HS256 (cambiar en producción) |
| `JWT_EXPIRATION_MS` | `86400000` (24 h) | Vida del access token |
| `JWT_RESET_EXPIRATION_MS` | `3600000` (1 h) | Vida del token de reset |
| `FRONTEND_URL` | `http://localhost:5173` | Origen permitido (CORS) y base de enlaces de correo |
| `MAIL_HOST/PORT/USERNAME/PASSWORD` | Gmail SMTP / vacío | Envío de correos |

---

## 15. Testing

### Frontend (Vitest + Testing Library)

- **Todas las pruebas viven directamente en `src/test/`** (planas, sin subcarpetas;
  ej. `src/core/utils.js` → `src/test/utils.test.js`). No se colocan junto al código.
- Importan el código bajo prueba con el alias `@/` (no rutas relativas).
- Config en [vitest.config.js](../Producto/frontend/vitest.config.js): entorno
  `jsdom`, `setupFiles: ['./src/test/setup.js']` (matchers de jest-dom + cleanup),
  cobertura con `v8`.

```bash
cd Producto/frontend
npm test            # corre toda la suite una vez
npm run test:watch  # modo watch
npm run test:coverage
```

Qué se cubre hoy: funciones puras de `utils` (`formatPrecio`, `imgPlaceholder`) y
componentes (`Button`, `Estrellas`, `LugarCard`).

### Backend (JUnit)

Hoy solo existe el test de arranque por defecto (`contextLoads`). Ampliar con
tests de servicios (Mockito) y de controllers (`@WebMvcTest`) queda pendiente.

---

## 16. Cómo ejecutar el proyecto

### Backend (requiere MySQL corriendo)

```bash
cd Producto/backend/eventout-backend
# 1) En application.properties: completar usuario/contraseña de MySQL
# 2) Levantar:
./mvnw spring-boot:run
```

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- La BD `eventout_db` y sus tablas se crean solas; el `DataInitializer` siembra los datos la primera vez.

### Frontend

```bash
cd Producto/frontend
npm install
npm run dev      # http://localhost:5173
```

Opcional: crear `.env.local` con `VITE_API_URL=http://localhost:8080` (es el valor por defecto).

---

## 17. Despliegue

- **Frontend:** `npm run build` genera `/dist` (estático). El `vercel.json` ya
  incluye el rewrite SPA. En el hosting hay que definir `VITE_API_URL` apuntando
  al backend desplegado.
- **Backend:** requiere un MySQL accesible y las variables de entorno de la §14
  (sobre todo `JWT_SECRET` y, para correo real, `MAIL_*`).

> La configuración de despliegue conjunto (dónde se hospeda el backend, SMTP real)
> aún está pendiente — ver "Pendientes" en [arquitectura-backend-springboot.md](arquitectura-backend-springboot.md).

---

## 18. Glosario

| Término | Definición |
|---------|------------|
| **JWT** | JSON Web Token. Pase firmado que el servidor entrega al iniciar sesión; el cliente lo envía en cada request (`Authorization: Bearer`). |
| **BCrypt** | Algoritmo para cifrar contraseñas (hash con sal). Las claves nunca se guardan en texto plano. |
| **Stateless** | El servidor no guarda sesión en memoria; cada request se valida por su token. |
| **Spring Boot** | Framework de Java para construir el backend (web, datos, seguridad). |
| **JPA / Hibernate** | Mapeo objeto-relacional: las entidades Java se convierten en tablas y consultas SQL. |
| **DTO** | Data Transfer Object. Lo que viaja por la red; evita exponer entidades y oculta datos sensibles (ej. el hash de contraseña). |
| **snake_case** | Convención de nombres con guion bajo (`es_gratuito`). El backend serializa el JSON así para coincidir con el frontend. |
| **CORS** | Permisos para que el navegador deje al frontend (`:5173`) llamar al backend (`:8080`). |
| **Swagger / OpenAPI** | Documentación interactiva de la API REST. |
| **MVVM** | Model-View-ViewModel. Separa datos, lógica y presentación en el frontend. |
| **Hook** | Función de React que empieza por `use`; permite estado y efectos en componentes. |
| **Context API** | Sistema de React para compartir estado global (ej. la sesión) sin "prop drilling". |
| **CVA** | Class Variance Authority. Maneja variantes de componentes con Tailwind. |
| **SPA** | Single Page Application. La app carga una vez y navega sin recargar el navegador. |
| **Lazy Loading** | Cargar código JS solo cuando se necesita, reduciendo el bundle inicial. |
| **FK** | Foreign Key. Columna que referencia la PK de otra tabla. |
| **UUID** | Identificador único universal (`550e8400-e29b-41d4-...`). Se guarda como `VARCHAR(36)`. |
| **react-leaflet** | Wrapper de React para la librería de mapas Leaflet. |
| **OpenStreetMap** | Mapa colaborativo y gratuito; alternativa sin costo a Google Maps. |
