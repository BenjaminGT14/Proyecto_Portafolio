# Entreteca

> _"El panorama perfecto está más cerca de lo que crees."_

Aplicación web responsiva que centraliza eventos, actividades y lugares de interés en Santiago de Chile. Proyecto de título — Duoc UC San Joaquín, 2026.

## Stack

- **Frontend:** React 19 + Vite + JavaScript
- **Estilos:** Tailwind CSS v4 + componentes propios estilo shadcn
- **Routing:** React Router 7
- **Backend:** Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **Mapas:** Leaflet + react-leaflet sobre OpenStreetMap (sin API key)
- **Despliegue:** Vercel

## Arquitectura

El frontend sigue un patrón **MVVM**:

```
Producto/
├─ src/
│  ├─ core/            # cliente Supabase, AuthContext, utils
│  ├─ model/           # entretecaRepository (acceso a datos) + mockData
│  ├─ view/
│  │  ├─ components/    # UI primitivos, layout, cards, mapa
│  │  └─ pages/         # Home, Lugares, Eventos, auth/*, admin/*
│  ├─ viewmodel/       # hooks por pantalla (public/, admin/, auth/, shared/)
│  ├─ App.jsx          # rutas
│  └─ main.jsx
├─ scripts/            # utilidades (fetch de datos desde Wikipedia)
├─ .env.example
├─ vercel.json
└─ vite.config.js
```

El repository (`src/model/entretecaRepository.js`) tiene un patrón de **fallback**: si las
variables de entorno de Supabase están presentes usa el backend real; si no, usa datos
**mock en memoria** (modo demo) para poder trabajar la UI sin backend.

> **Backend:** el esquema de la base de datos (tablas, RLS, triggers, índices, seeds) y las
> Edge Functions de administración se gestionan en Supabase y **no forman parte de este
> repositorio**. Ver la carpeta `Documentacion/` para el detalle de tablas, políticas RLS y
> autorización de las Edge Functions.

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales reales de Supabase

# 3. Levantar el dev server
npm run dev
```

Si **no** se completan las variables de entorno, la app funciona igual con **datos mock**
(ver `src/model/mockData.js`). Esto permite trabajar la UI sin depender de Supabase.

## Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com) y aplicar el esquema de la BD
   (gestionado fuera de este repo; ver `Documentacion/`).
2. En **Settings → API**, copiar la URL del proyecto y el `anon public` key.
3. Pegarlos en `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

4. Reiniciar `npm run dev`.

## Funcionalidades implementadas

| HU | Funcionalidad | Estado |
|----|---------------|--------|
| HU-01 | Registro con correo + contraseña | ✓ |
| HU-02 | Recuperación de contraseña | ✓ |
| HU-03 | Búsqueda de lugares por categoría | ✓ |
| HU-04 | Filtros avanzados (costo, comuna) | ✓ |
| HU-05 | Mapa interactivo (Leaflet + OpenStreetMap) | ✓ |
| HU-06 | Detalle de lugar/evento | ✓ |
| HU-07 | Publicación de reseñas | ✓ |
| HU-08 | Votar reseñas | ✓ |
| HU-09 | Favoritos | ✓ |
| HU-10 | Diseño responsivo | ✓ |
| HU-11 | Gestión admin de contenido | ✓ |
| HU-12 | Moderación de reseñas | ✓ |

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
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon del proyecto Supabase |

## Equipo

- Benjamin Gatica
- Diego Olmos
- Joaquín González

Profesor guía: Jorge Niochet
