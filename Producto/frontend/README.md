# EventOut

> _"El panorama perfecto está más cerca de lo que crees."_

Aplicación web responsiva que centraliza eventos, actividades y lugares de interés en Santiago de Chile. Proyecto de título — Duoc UC San Joaquín, 2026.

## Stack

- **Frontend:** React 19 + Vite + JavaScript
- **Estilos:** Tailwind CSS v4 + componentes propios estilo shadcn
- **Routing:** React Router 7
- **Backend:** API REST propia en Spring Boot (Java) + MySQL
- **Mapas:** Google Maps Platform (pendiente, Sprint 3)
- **Despliegue:** Vercel

## Estructura

```
Producto/
├─ src/
│  ├─ components/       # UI primitivos, layout y cards
│  ├─ contexts/         # AuthProvider y context object
│  ├─ hooks/            # useAuth, useAsyncData
│  ├─ lib/              # api.js, mockData, utils
│  ├─ pages/            # Home, Lugares, Eventos, auth/*, placeholders
│  ├─ App.jsx           # rutas
│  └─ main.jsx
├─ .env.example
└─ vite.config.js
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend (VITE_API_URL)

# 3. Levantar el dev server
npm run dev
```

El frontend consume la API REST definida en `VITE_API_URL` (por defecto `http://localhost:8080`).

## Configurar el backend

El frontend consume la API REST de Spring Boot (`Producto/backend/eventout-backend`).

1. Levantar el backend (crea la base MySQL `eventout_db` automáticamente la primera vez).
2. Apuntar el frontend al backend en `.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

3. Reiniciar `npm run dev`.

## Funcionalidades implementadas (Sprints 1-4)

| HU | Funcionalidad | Estado |
|----|---------------|--------|
| HU-01 | Registro con correo + contraseña | ✓ |
| HU-02 | Recuperación de contraseña | ✓ |
| HU-03 | Búsqueda de lugares por categoría | ✓ |
| HU-04 | Filtros avanzados (costo, comuna) | ✓ |
| HU-05 | Mapa interactivo con Google Maps | ✓ |
| HU-06 | Detalle de lugar/evento | ✓ |
| HU-07 | Publicación de reseñas | ✓ |
| HU-08 | Votar reseñas | ✓ |
| HU-09 | Favoritos | pendiente (Sprint 5) |
| HU-10 | Diseño responsivo | ✓ |
| HU-11 | Gestión admin de contenido | pendiente (Sprint 5) |
| HU-12 | Moderación de reseñas | pendiente (Sprint 5) |

## Scripts

```bash
npm run dev       # dev server con HMR
npm run build     # build de producción a dist/
npm run preview   # sirve dist/ localmente
npm run lint      # ESLint
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend Spring Boot (por defecto `http://localhost:8080`) |
| `VITE_GOOGLE_MAPS_API_KEY` | API key con Maps JavaScript API y Places API habilitadas |

## Equipo

- Benjamin Gatica
- Diego Olmos
- Joaquín González

Profesor guía: Jorge Niochet
