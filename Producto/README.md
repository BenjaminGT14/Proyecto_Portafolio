# Entreteca

> _"El panorama perfecto está más cerca de lo que crees."_

Aplicación web responsiva que centraliza eventos, actividades y lugares de interés en Santiago de Chile. Proyecto de título — Duoc UC San Joaquín, 2026.

## Stack

- **Frontend:** React 19 + Vite + JavaScript
- **Estilos:** Tailwind CSS v4 + componentes propios estilo shadcn
- **Routing:** React Router 7
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Mapas:** Google Maps Platform (pendiente, Sprint 3)
- **Despliegue:** Vercel

## Estructura

```
Producto/
├─ src/
│  ├─ components/       # UI primitivos, layout y cards
│  ├─ contexts/         # AuthProvider y context object
│  ├─ hooks/            # useAuth, useAsyncData
│  ├─ lib/              # cliente Supabase, api.js, mockData, utils
│  ├─ pages/            # Home, Lugares, Eventos, auth/*, placeholders
│  ├─ App.jsx           # rutas
│  └─ main.jsx
├─ supabase/
│  └─ schema.sql        # tablas, índices, RLS y seeds
├─ .env.example
└─ vite.config.js
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales reales de Supabase y Google Maps

# 3. Levantar el dev server
npm run dev
```

Si **no** se completan las variables de entorno, la app funciona igual con **datos mock** (ver `src/lib/mockData.js`). Esto permite trabajar la UI sin depender de Supabase.

## Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Ir a **SQL Editor** y ejecutar el contenido completo de `supabase/schema.sql`.
3. En **Settings → API**, copiar la URL del proyecto y el `anon public` key.
4. Pegarlos en `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

5. Reiniciar `npm run dev`.

> El `schema.sql` incluye: tablas, constraints (XOR para reseñas/favoritos, UNIQUE para votos, CHECK de fechas), índices, trigger para crear filas en `public.usuario` al registrarse, RLS por rol, y datos semilla de categorías.

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
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon del proyecto Supabase |
| `VITE_GOOGLE_MAPS_API_KEY` | API key con Maps JavaScript API y Places API habilitadas |

## Equipo

- Benjamin Gatica
- Diego Olmos
- Joaquín González

Profesor guía: Jorge Niochet
