# EventOut

> _"El panorama perfecto está más cerca de lo que crees."_

Aplicación web responsiva que centraliza eventos, actividades y lugares de interés en Santiago de Chile. Proyecto de título — Duoc UC San Joaquín, 2026.

## Stack

- **Frontend:** React 19 + Vite + JavaScript
- **Estilos:** Tailwind CSS v4 + componentes propios estilo shadcn
- **Routing:** React Router 7
- **Backend:** API REST propia en Spring Boot (Java) + MySQL
- **Mapas:** Leaflet

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

## Funcionalidades implementadas

| HU | Funcionalidad | Estado |
|----|---------------|--------|
| HU-01 | Registro con correo + contraseña | ✓ |
| HU-02 | Búsqueda de lugares por categoría | ✓ |
| HU-03 | Filtros avanzados (costo, comuna) | ✓ |
| HU-04 | Mapa interactivo (Leaflet / OpenStreetMap) | ✓ |
| HU-05 | Detalle de lugar/evento | ✓ |
| HU-06 | Publicación de reseñas | ✓ |
| HU-07 | Votar reseñas | ✓ |
| HU-08 | Favoritos | ✓ |
| HU-09 | Diseño responsivo | ✓ |
| HU-10 | Gestión admin de contenido | ✓ |
| HU-11 | Moderación de reseñas | ✓ |
| HU-12 | Propuesta de eventos por usuarios | ✓ |

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
