# Arquitectura del Backend (Spring Boot + MySQL) y del Frontend

> Documento técnico del **backend propio** hecho con **Spring Boot** y base de datos
> **MySQL** (`eventout_db`), más la forma en que el **frontend** (React) consume la API
> por REST con autenticación **JWT**.

---

## 1. Visión general

### ¿De qué se trata?
El sistema tiene un **backend propio** que centraliza toda la lógica y los datos, y un
**frontend** (React) que lo consume por REST con autenticación JWT:

```
┌────────────┐     HTTP/JSON (REST)      ┌─────────────────────┐      JPA/JDBC      ┌──────────┐
│  Frontend  │  ───────────────────────► │  Backend Spring Boot │  ───────────────►  │  MySQL   │
│  (React)   │  ◄─── JWT + {data} ─────── │  (controller→service │                    │ eventout │
│  :5173     │                           │   →repository→model) │                    │   _db    │
└────────────┘                           └─────────────────────┘                    └──────────┘
```

### ¿Para qué sirve?
- **Independencia:** el equipo controla 100% del backend (no depende de un BaaS externo).
- **Demostrable en la defensa:** capas clásicas (Controller, Service, Repository, Model),
  seguridad con JWT y persistencia en MySQL — todo construido por nosotros.
- **Mismo comportamiento de la app:** el frontend se mantiene casi igual; solo cambió la
  **capa de datos** y la **autenticación**.

### Stack
| Capa | Tecnología |
|---|---|
| Lenguaje / runtime | Java 21 (compila también en JDK 24) |
| Framework | Spring Boot 3.5.x (Web, Data JPA, Security, Validation) |
| Base de datos | MySQL 8 (`eventout_db`) |
| ORM | Hibernate (JPA) |
| Autenticación | JWT (librería JJWT 0.12) |
| Documentación API | springdoc-openapi (Swagger UI) |
| Utilidades | Lombok |
| Frontend | React 19 + Vite + React Router (patrón MVVM) |

---

## 2. Estructura del backend

Ruta: `Producto/backend/eventout-backend`
Paquete base: `com.proyectoPortafolio.eventout_backend`

```
src/main/java/.../eventout_backend/
├── EventoutBackendApplication.java     # arranque
├── config/
│   ├── SecurityConfig.java             # seguridad + CORS
│   ├── OpenApiConfig.java              # Swagger con botón "Authorize" (JWT)
│   └── DataInitializer.java            # siembra de datos inicial
├── model/                              # entidades JPA (tablas)
│   ├── Categoria, Lugar, Evento, Usuario,
│   │   Resena, VotoResena, Favorito
│   └── enums/ Rol, EstadoResena
├── repository/                         # interfaces Spring Data JPA
├── dto/                                # objetos de transporte (entrada/salida)
│   └── request/                        # DTOs de entrada con validación
├── mapper/DtoMapper.java               # entidad → DTO
├── service/                            # lógica de negocio
│   ├── AuthService, CategoriaService, LugarService, EventoService,
│   │   ResenaService, VotoService, FavoritoService
├── security/                           # JWT
│   ├── JwtService, JwtAuthenticationFilter, AuthUser
├── controller/                         # endpoints REST
│   ├── AuthController, CategoriaController, LugarController,
│   │   EventoController, ResenaController, VotoController, FavoritoController
│   └── admin/ AdminLugarController, AdminEventoController, AdminResenaController
└── exception/                          # errores → JSON { "error": "..." }
    ├── GlobalExceptionHandler + NotFound/BadRequest/Conflict/Unauthorized
src/main/resources/application.properties
```

### ¿Por qué esta separación en capas?
- **Controller:** recibe la petición HTTP, valida el formato y delega. No tiene lógica.
- **Service:** contiene las reglas de negocio (ej. "una reseña apunta a un lugar **o** a un
  evento, nunca a ambos") y la transacción.
- **Repository:** acceso a datos (consultas a MySQL) sin SQL manual gracias a Spring Data JPA.
- **Model (entidad):** representa una tabla.
- **DTO:** lo que viaja por la red; evita exponer la entidad y oculta datos sensibles (ej. el
  hash de contraseña).

---

## 3. Modelo de datos

Entidades y relaciones (todas las PK de tipo UUID se guardan como `VARCHAR(36)`; `categoria`
usa una PK de texto como `cat-parque`):

| Entidad | Tabla | Campos clave | Relaciones |
|---|---|---|---|
| `Categoria` | categoria | id (texto), nombre, icono | — |
| `Lugar` | lugar | id, nombre, descripcion, direccion, comuna, latitud, longitud, es_gratuito, precio, horario, imagen_url, wikipedia_slug | `@ManyToOne` → Categoria |
| `Evento` | evento | id, nombre, descripcion, fecha_inicio, fecha_fin, es_gratuito, precio, imagen_url | `@ManyToOne` → Lugar |
| `Usuario` | usuario | id, email (único), password_hash, nombre, avatar_url, rol | — |
| `Resena` | resena | id, titulo, contenido, puntuacion, estado, created_at | `@ManyToOne` → Usuario, Lugar **XOR** Evento |
| `VotoResena` | voto_resena | id, es_positivo | `@ManyToOne` → Usuario, Resena (único por usuario+reseña) |
| `Favorito` | favorito | id | `@ManyToOne` → Usuario, Lugar **XOR** Evento |

### Enums
- **`Rol`**: `USER`, `ADMIN`. En JSON se serializa en minúsculas (`"user"`/`"admin"`) para que
  el frontend siga leyendo `profile.rol === 'admin'`.
- **`EstadoResena`**: `VISIBLE`, `OCULTA`, `ELIMINADA` → en JSON `"visible"`/`"oculta"`/`"eliminada"`.

### Regla "XOR" (lugar o evento)
Las reseñas y favoritos apuntan a **exactamente uno**: un lugar *o* un evento. Esta regla se
valida en el **service** antes de guardar.

### Cálculo de "reseña con votos"
El `ResenaService` calcula los `votos_positivos`, `votos_negativos` y `score`
(positivos − negativos) mediante una consulta agregada
(`VotoResenaRepository.contarVotosPorResena`).

---

## 4. Seguridad con JWT

### ¿Qué es y cómo funciona?
JWT (JSON Web Token) es un "pase" firmado que el servidor entrega al iniciar sesión. El cliente
lo guarda y lo envía en cada petición; el servidor lo valida sin guardar sesión en memoria
(*stateless*).

**Flujo:**
1. `POST /auth/login` con email y contraseña.
2. El backend valida la contraseña (BCrypt) y devuelve `{ token, usuario }`.
3. El frontend guarda el `token` y lo manda en cada request: `Authorization: Bearer <token>`.
4. `JwtAuthenticationFilter` intercepta cada petición, valida la firma/expiración del token y
   coloca un `AuthUser` (id, email, rol) en el contexto de seguridad.

### Piezas
- **`JwtService`**: genera y valida tokens (HS256). El token lleva como *subject* el id del
  usuario y como *claims* su email, rol y nombre.
- **`JwtAuthenticationFilter`**: lee el header `Authorization`, valida y autentica la request.
- **`AuthUser`**: principal liviano que viaja en el contexto (no consulta la BD en cada request).
- **`SecurityConfig`**: define qué rutas son públicas y cuáles requieren autenticación o rol admin:

| Tipo | Reglas |
|---|---|
| Público (sin token) | `POST /auth/register`, `POST /auth/login`, `GET /categorias`, `GET /lugares/**`, `GET /eventos/**`, `GET /resenas`, Swagger |
| Autenticado | `POST /resenas`, `/votos`, `/favoritos/**`, `GET /auth/me` |
| Solo admin (`ROLE_ADMIN`) | `/admin/**` |

Las contraseñas se guardan **cifradas con BCrypt** (nunca en texto plano). Los errores de
seguridad responden en JSON: `401 {"error":"No autenticado"}` / `403 {"error":"Acceso denegado"}`.

---

## 5. Endpoints (API REST)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | público | Crear cuenta (auto-login: devuelve token) |
| POST | `/auth/login` | público | Iniciar sesión → token + usuario |
| GET | `/auth/me` | autenticado | Perfil del usuario del token |
| GET | `/categorias` | público | Lista de categorías |
| GET | `/lugares` | público | Lista con filtros `idCategoria, comuna, costo, q` |
| GET | `/lugares/{id}` | público | Detalle de un lugar |
| GET | `/eventos` | público | Lista con filtros `comuna, costo, q, desde` |
| GET | `/eventos/{id}` | público | Detalle de un evento |
| GET | `/resenas?idLugar=..` ó `?idEvento=..` | público | Reseñas visibles + conteo de votos |
| POST | `/resenas` | autenticado | Publicar reseña (autor del token) |
| POST | `/votos` | autenticado | Votar reseña (toggle positivo/negativo) |
| GET | `/votos?idsResenas=a,b` | autenticado | Votos del usuario sobre esas reseñas |
| GET | `/favoritos` | autenticado | Lugares y eventos favoritos del usuario |
| GET | `/favoritos/estado?idLugares=..&idEventos=..` | autenticado | Cuáles son favoritos |
| POST | `/favoritos/toggle` | autenticado | Agregar/quitar favorito |
| POST/PUT/DELETE | `/admin/lugares[/{id}]` | admin | CRUD de lugares |
| POST/PUT/DELETE | `/admin/eventos[/{id}]` | admin | CRUD de eventos |
| GET | `/admin/resenas` | admin | Todas las reseñas (moderación) |
| PATCH | `/admin/resenas/{id}` | admin | Cambiar estado (visible/oculta/eliminada) |

**Swagger UI:** `http://localhost:8080/swagger-ui.html` (incluye botón *Authorize* para pegar el JWT).

---

## 6. DTOs y formato JSON (snake_case)

El frontend ya usaba nombres con guion bajo (`es_gratuito`, `fecha_inicio`, `id_lugar`,
`created_at`…). Para no tocar componentes, el backend serializa **todo el JSON en snake_case**
(`spring.jackson.property-naming-strategy=SNAKE_CASE`). Así, un campo Java `esGratuito` viaja como
`es_gratuito` automáticamente, tanto al enviar como al recibir.

- **DTOs de salida** (`dto/`): `LugarDto`, `EventoDto`, `ResenaDto`, `UsuarioDto`, etc. Anidan
  objetos relacionados (ej. un `EventoDto` incluye su `LugarDto`).
- **DTOs de entrada** (`dto/request/`): `RegisterRequest`, `LoginRequest`, `LugarRequest`,
  `EventoRequest`, `ResenaRequest`, etc. Llevan **validaciones** (`@NotBlank`, `@Email`,
  `@Size`, `@Min/@Max`). Si fallan, responden `400 {"error":"mensaje"}`.
- **`DtoMapper`**: convierte entidad → DTO en un solo lugar, evitando exponer entidades y
  problemas de carga perezosa (lazy) al serializar.

---

## 7. Manejo de errores

`GlobalExceptionHandler` (`@RestControllerAdvice`) traduce excepciones a respuestas JSON con el
formato `{ "error": "..." }` (el mismo que el frontend ya leía como `json.error`):

| Excepción | HTTP |
|---|---|
| `NotFoundException` | 404 |
| `BadRequestException` / validación | 400 |
| `ConflictException` (email repetido) | 409 |
| `UnauthorizedException` (credenciales) | 401 |
| cualquier otra | 500 |

---

## 8. Siembra de datos (DataInitializer)

`DataInitializer` (un `CommandLineRunner`) carga, **la primera vez que la BD está vacía**, los
mismos datos que el frontend usaba como *mock*: 6 categorías, 8 lugares, 5 eventos, 6 reseñas y
9 votos, además de los usuarios. Las contraseñas se cifran con BCrypt. Es **idempotente**: cada
bloque solo se ejecuta si su tabla está vacía.

**Usuarios sembrados (para pruebas):**
| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Administrador | `admin@eventout.cl` | `admin1234` | admin |
| Andrea, Ricardo, Elena, Matías, Camila | `<nombre>@eventout.cl` | `demo1234` | user |

---

## 9. Configuración (`application.properties`)

Puntos clave:
- **Datasource MySQL**: la BD `eventout_db` se crea sola la primera vez
  (`createDatabaseIfNotExist=true`). El usuario/contraseña se completan en el archivo.
- **JPA**: `ddl-auto=update` (Hibernate crea/actualiza las tablas según las entidades).
- **Jackson**: `SNAKE_CASE`, fechas en ISO, zona `America/Santiago`.
- **JWT**: `app.jwt.secret` (clave HS256), `app.jwt.expiration-ms` (24 h).
  Sobre-escribibles por variables de entorno.
- **CORS**: permite el origen del frontend (`app.frontend.url`, por defecto `http://localhost:5173`).

---

## 10. Integración del Frontend

El frontend sigue el patrón **MVVM** (`view` / `viewmodel` / `model`). La **capa de datos** y la
**autenticación** se apoyan en el contrato `{ data, error }`, de modo que viewmodels y
componentes consumen la API sin acoplarse a los detalles del transporte.

| Archivo | Rol |
|---|---|
| `src/core/api.js` | Cliente REST con `fetch`: base URL (`VITE_API_URL`), token JWT en `localStorage` y helper `buildQuery`. Devuelve siempre `{ data, error }`. |
| `src/model/eventoutRepository.js` | Capa de acceso a datos: cada función llama a la API REST manteniendo firmas estables para los viewmodels. |
| `src/core/auth/AuthContext.jsx` | `signUp/signIn/signOut` usan los endpoints `/auth/*`; al cargar valida el token con `/auth/me`. |
| `.env.example` | Documenta `VITE_API_URL` (URL del backend). |

### Detalle del contrato `{ data, error }`
- El repositorio sigue devolviendo `{ data, error }`, por eso `useAsyncData` y todos los
  viewmodels funcionan igual.
- `obtenerEstadoFavoritos` sigue devolviendo **Sets** (`data.lugares.has(id)`), aunque el backend
  responda arrays: la conversión se hace en el repositorio.
- Los cuerpos que el frontend envía van en **snake_case** (`id_lugar`, `es_positivo`, etc.) para
  que Jackson los entienda.
- El token JWT se guarda en `localStorage` bajo la clave `eventout_token`.

---

## 11. Cómo ejecutar

### Backend
```bash
cd Producto/backend/eventout-backend
# 1) En application.properties, completar usuario/contraseña de MySQL
# 2) Levantar (MySQL debe estar corriendo):
./mvnw spring-boot:run
```
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### Frontend
```bash
cd Producto/frontend
npm install
npm run dev      # http://localhost:5173
```
Opcional: crear `.env` con `VITE_API_URL=http://localhost:8080` (es el valor por defecto).

---

## 12. Verificaciones realizadas

- **Backend**: compila (Maven), arranca contra MySQL, crea `eventout_db`, siembra datos y
  responde correctamente. Probado por `curl`: endpoints públicos, login JWT, `/auth/me`,
  guards de admin (401/403), favoritos, votos y reseñas.
- **Frontend**: `npm run lint` sin errores, `npm run build` exitoso y `npm run dev` sirviendo en
  `:5173`.
- **CORS**: preflight y peticiones `:5173 → :8080` correctas.

---

## 13. Feature: propuestas de eventos por usuarios

Los usuarios autenticados pueden **proponer eventos**, que quedan **pendientes de
aprobación** por un administrador antes de hacerse públicos. El formulario de propuesta es el
**mismo** que usa el admin para crear eventos (componente compartido).

### Modelo
- `Evento` gana dos campos: `estado` (`EstadoEvento`: `PENDIENTE` / `APROBADO` / `RECHAZADO`)
  y `propuestoPor` (`Usuario` que la propuso; null para eventos del admin).
- Eventos creados por admin (y los sembrados) nacen **APROBADO**; las propuestas de usuarios
  nacen **PENDIENTE**.

### Reglas
- El listado y el detalle **públicos** solo muestran eventos `APROBADO`.
- Una propuesta solo se vuelve pública cuando el admin la **aprueba**.

### Endpoints nuevos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/eventos/propuestas` | autenticado | Propone un evento (queda PENDIENTE). Mismo payload que el alta admin. |
| GET | `/admin/eventos` | admin | Lista todos los eventos; `?estado=pendiente` filtra propuestas. |
| PATCH | `/admin/eventos/{id}/estado` | admin | Aprueba/rechaza (`{ "estado": "aprobado" | "rechazado" }`). |

> Nota técnica: el `estado` como **query param** se recibe como `String` y se convierte con
> `EstadoEvento.from()` (la conversión por defecto de Spring para enums es por nombre de
> constante y no aceptaría el valor en minúsculas; el `@JsonCreator` solo aplica al body).

### Frontend
- **`EventoFormFields`** (nuevo componente): los campos del formulario de evento, reutilizados
  por el panel admin (alta/edición en modal) y por la página pública de propuesta.
- **Página `/eventos/proponer`** (`ProponerEvento`, ruta protegida): formulario + confirmación
  "tu propuesta quedó pendiente de aprobación".
- **Botón "Proponer evento"** en la página de Eventos.
- **Panel admin de Eventos**: sección "Propuestas pendientes de aprobación" con botones
  **Aprobar / Rechazar**, badges de estado en la tabla y conteo de pendientes en el dashboard.
- El repositorio suma `proponerEvento`, `listarEventosAdmin(estado?)` y
  `cambiarEstadoEvento({ idEvento, estado })`.

Verificado end-to-end (navegador): usuario propone → no aparece en público → admin la ve en
"pendientes" → aprueba → aparece en público.

---

## 14. Pendientes

1. (Opcional) Mover el secret JWT y credenciales a variables de entorno para producción.
2. (Opcional) Vista "mis propuestas" para que el usuario siga el estado de lo que propuso.
