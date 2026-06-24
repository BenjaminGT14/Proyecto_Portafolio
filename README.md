# EventOut

Aplicación web fullstack para descubrir lugares, eventos y actividades culturales y
recreativas en Santiago de Chile. _"El panorama perfecto está más cerca de lo que crees."_

## ¿De qué trata?

EventOut centraliza la oferta de ocio de Santiago en una sola plataforma. Los usuarios pueden
explorar lugares y eventos en un mapa interactivo, filtrarlos por categoría, comuna o costo,
guardar favoritos y participar de una comunidad que publica y vota reseñas. Un panel de
administración permite gestionar el contenido y moderar las reseñas.

Está construido como un monorepo con dos piezas:

- Frontend: SPA en React + Vite (patrón MVVM).
- Backend: API REST propia en Spring Boot + MySQL, con autenticación JWT.

<!-- Captura o GIF de la app: ![EventOut](docs/screenshot.png) -->
<!-- Demo en vivo: https://<tu-dominio>.vercel.app -->

## Características

- Autenticación con JWT: registro, inicio de sesión y recuperación de contraseña por correo.
- Búsqueda y filtros por categoría, comuna y costo (gratis / pagado).
- Mapa interactivo con lugares y eventos georreferenciados (Leaflet).
- Reseñas de la comunidad: publicación solo para usuarios autenticados, visibles al instante.
- Likes y dislikes por usuario; las reseñas con mejor valoración se muestran primero.
- Favoritos: guarda lugares y eventos en tu perfil.
- Propuestas de eventos: los usuarios proponen eventos que un administrador aprueba.
- Panel de administración: CRUD de lugares y eventos, y moderación de reseñas.

## Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | React 19 · Vite 8 · Tailwind CSS v4 · React Router 7 · React-Leaflet / Leaflet · lucide-react · clsx + tailwind-merge — patrón MVVM |
| Backend | Spring Boot 3.5 (Web · Data JPA · Security · Validation · Mail) · Java 21 · MySQL 8 · Hibernate/JPA · JWT (JJWT) · springdoc-openapi (Swagger UI) · Lombok |
| Pruebas | Frontend: Vitest + Testing Library + jsdom · Backend: JUnit 5 + Mockito |
| Tooling | ESLint · Maven (wrapper) · npm |

## Arquitectura

```
┌────────────┐    HTTP/JSON (REST) + JWT    ┌──────────────────────┐    JPA/Hibernate   ┌──────────┐
│  Frontend  │  ─────────────────────────►  │  Backend Spring Boot │  ───────────────►  │  MySQL   │
│  (React)   │  ◄──── { data, error } ─────  │  controller → service │                    │ eventout │
│   :5173    │                              │  → repository → model │                    │   _db    │
└────────────┘                              └──────────────────────┘                    └──────────┘
```

```
Producto/
├─ frontend/                 # SPA React + Vite (view / viewmodel / model / core)
└─ backend/
   └─ eventout-backend/      # API REST Spring Boot (controller, service, repository, security…)
```

## Requisitos previos

- Node.js >= 20.19 o 22
- Java 21 (JDK)
- MySQL 8 en ejecución
- Maven: no es necesario instalarlo, se incluye el wrapper (`mvnw`)

## Cómo ejecutar

El proyecto tiene dos partes; levanta primero el backend y luego el frontend.

### 1) Backend (API REST)

```bash
cd Producto/backend/eventout-backend
```

Configura tus credenciales de MySQL en `src/main/resources/application.properties`
(la base `eventout_db` se crea automáticamente la primera vez):

```properties
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
```

Levanta el servidor:

```bash
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

- API: http://localhost:8080
- Documentación (Swagger UI): http://localhost:8080/swagger-ui.html

La primera vez, un `DataInitializer` siembra datos de ejemplo (categorías, lugares, eventos,
reseñas y usuarios).

### 2) Frontend (SPA)

```bash
cd Producto/frontend
npm install
```

Crea un archivo `.env` apuntando al backend:

```env
VITE_API_URL=http://localhost:8080
```

Levanta el servidor de desarrollo:

```bash
npm run dev                   # http://localhost:5173
```

## Variables de entorno

| Componente | Variable | Descripción |
|------------|----------|-------------|
| Frontend | `VITE_API_URL` | URL base del backend (por defecto `http://localhost:8080`) |
| Backend | `spring.datasource.username` / `password` | Credenciales de MySQL |
| Backend | `JWT_SECRET` | Clave HS256 para firmar los tokens (override en producción) |
| Backend | `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP para correos de recuperación (opcional en desarrollo) |

## Usuarios de prueba

Sembrados automáticamente por el backend:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@eventout.cl` | `admin1234` |
| Usuario | `andrea@eventout.cl` (y `ricardo`, `elena`, `matias`, `camila`) | `demo1234` |

## Pruebas

```bash
# Frontend (Vitest + Testing Library)
cd Producto/frontend
npm test                      # ejecuta la suite
npm run test:coverage         # genera reporte de cobertura en coverage/

# Backend (JUnit 5 + Mockito)
cd Producto/backend/eventout-backend
./mvnw test                   # Windows: mvnw.cmd test
```

## Estructura del repositorio

```
Proyecto_Portafolio/
├─ Producto/
│  ├─ frontend/                  # React + Vite
│  └─ backend/eventout-backend/  # Spring Boot + MySQL
├─ Documentacion/                # documentación técnica
└─ Gestion/                      # gestión del proyecto
```

## Documentación

- [Arquitectura del backend (Spring Boot + MySQL) y del frontend](Documentacion/arquitectura-backend-springboot.md)
- [README del frontend](Producto/frontend/README.md)
