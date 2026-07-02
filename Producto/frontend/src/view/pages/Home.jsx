import { Link } from 'react-router-dom'
import { Icon } from '@/view/components/ui/Icon'
import { MapaLazy as Mapa } from '@/view/components/MapaLazy'
import { BotonFavorito } from '@/view/components/BotonFavorito'
import { ResenaCard } from '@/view/components/ResenaCard'
import { useHomeViewModel } from '@/viewmodel/public/useHomeViewModel'
import { useResenasDestacadasViewModel } from '@/viewmodel/public/useResenasDestacadasViewModel'
import { cn, formatPrecio, imgPlaceholder } from '@/core/utils'
import heroSantiago from '@/assets/Hero/hero-santiago.webp'

export function HomePage() {
  const vm = useHomeViewModel()
  const reviews = useResenasDestacadasViewModel({ limit: 6 })

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[560px] items-center overflow-hidden pt-20 sm:min-h-[700px] md:min-h-[860px] xl:min-h-[940px]">
        <div className="absolute inset-0 z-0">
          {/* Una sola imagen que ocupa TODO el espacio de forma limpia */}
          <img
            src={heroSantiago}
            alt="Costanera Center y skyline de Santiago al anochecer"
            className="h-full w-full object-cover object-center"
            fetchPriority="high"
          />
          {/* Capa de oscuridad (Overlay) para garantizar la legibilidad del texto */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center md:text-left xl:max-w-[1440px] xl:px-10">
          <div className="max-w-2xl xl:max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl xl:text-6xl drop-shadow-sm">
              Descubre qué hacer cerca de ti
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-slate-200 xl:text-xl drop-shadow-sm">
              Eventos, cultura y naturaleza en un solo lugar. El panorama perfecto está más cerca de lo que crees.
            </p>

            <form
              onSubmit={vm.handleBuscar}
              className="flex flex-col items-center gap-4 rounded-xl bg-white p-4 shadow-2xl md:flex-row"
            >
              <div className="relative w-full flex-1">
                <Icon
                  name="search"
                  size="md"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                />
              <input
                type="text"
                  aria-label="Buscar lugares y eventos"
                  value={vm.q}
                  onChange={(e) => vm.setQ(e.target.value)}
                  placeholder="¿Qué buscas hoy?"
                  className="w-full rounded-lg border border-outline-variant py-3 pl-11 pr-4 text-base outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
              <select
                aria-label="Categoría"
                value={vm.categoriaSel}
                onChange={(e) => vm.setCategoriaSel(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-4 py-3 text-base outline-none focus:border-secondary focus:ring-1 focus:ring-secondary md:w-44"
              >
                <option value="">Categoría</option>
                {vm.categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar por precio"
                value={vm.costoSel}
                onChange={(e) => vm.setCostoSel(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-4 py-3 text-base outline-none focus:border-secondary focus:ring-1 focus:ring-secondary md:w-44"
              >
                <option value="">Todos los precios</option>
                <option value="gratis">Gratis</option>
                <option value="pagado">Pagado</option>
              </select>
              <button
                type="submit"
                className="w-full whitespace-nowrap rounded-lg bg-secondary px-8 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:brightness-110 active:scale-95 md:w-auto"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ---------- Split: Mapa + Lista ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 xl:max-w-[1440px] xl:px-10">
        <div className="flex h-auto flex-col gap-6 lg:h-[700px] lg:flex-row">
          <div className="flex-1 overflow-hidden rounded-xl shadow-sm">
            <Mapa puntos={vm.puntos} altura="h-[500px] lg:h-full" />
          </div>

          <div className="no-scrollbar flex w-full flex-col gap-4 overflow-y-auto pr-2 lg:w-[420px] xl:w-[480px]">
            <h3 className="mb-2 flex items-center justify-between text-xl font-semibold">
              Resultados cercanos
              <span className="text-xs font-normal text-outline">
                {vm.puntos.length} encontrados
              </span>
            </h3>
            {vm.lugares.slice(0, 6).map((lugar) => (
              <LugarCardCompacta key={lugar.id_lugar} lugar={lugar} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Categorías ---------- */}
      <section className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-7xl px-6 xl:max-w-[1440px] xl:px-10">
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight xl:text-4xl">
            Explora por categorías
          </h2>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:max-w-none lg:grid-cols-6">
            {vm.categorias.map((c) => {
              const cfg = vm.getCategoriaConfig(c.nombre)
              return (
                <Link
                  key={c.id_categoria}
                  to={`/lugares?idCategoria=${c.id_categoria}`}
                  className="group rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className={cn(
                      'mx-auto mb-4 flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                      cfg.bg,
                    )}
                  >
                    <Icon name={cfg.icon} size="md" className={cfg.color} />
                  </div>
                  <span className="block text-sm font-semibold">{c.nombre}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- Reseñas de la comunidad ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 xl:max-w-[1440px] xl:px-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight xl:text-4xl">
              Opiniones de la comunidad
            </h2>
            <p className="mt-2 text-base text-outline">
              Las reseñas mejor valoradas por otros exploradores como tú.
            </p>
          </div>
          <button
            type="button"
            onClick={reviews.handleEscribir}
            className="hidden items-center gap-2 font-bold text-secondary hover:underline md:flex"
          >
            Escribir una reseña <Icon name="edit" size="sm" />
          </button>
        </div>

        {reviews.loading ? (
          <ResenasSkeleton />
        ) : reviews.resenas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-outline-variant bg-white p-10 text-center text-sm text-outline">
            Aún no hay reseñas publicadas. ¡Sé el primero en compartir tu experiencia
            en un lugar o evento!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.resenas.map((r) => (
              <ResenaCard
                key={r.id_resena}
                resena={r}
                votoUsuario={reviews.votoPorResena.get(r.id_resena)}
                onVotar={(esPositivo) => reviews.handleVotar(r.id_resena, esPositivo)}
                origen={
                  r.id_lugar
                    ? { to: `/lugares/${r.id_lugar}`, nombre: r.lugar?.nombre }
                    : r.id_evento
                      ? { to: `/eventos/${r.id_evento}`, nombre: r.evento?.nombre }
                      : null
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 xl:max-w-[1440px] xl:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-on-primary-fixed to-secondary p-6 text-center shadow-xl sm:p-10 md:p-12 md:text-left xl:p-16">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="min-w-0 flex-1">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Empieza a explorar tu ciudad hoy
              </h2>
              <p className="text-base text-slate-200 opacity-90">
                Únete a miles de personas que redescubren sus rincones favoritos cada semana.
              </p>
            </div>
            <button
              type="button"
              onClick={vm.goToLugares}
              className="shrink-0 self-center rounded-xl bg-white px-6 py-3 text-base font-bold text-primary shadow-lg transition-all hover:scale-105 active:scale-95 sm:px-10 sm:py-4 sm:text-lg md:self-auto"
            >
              Ver panoramas cercanos
            </button>
          </div>
          <div className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>
    </>
  )
}

function ResenasSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-full bg-surface-container-high" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-surface-container-high" />
              <div className="h-2 w-16 animate-pulse rounded bg-surface-container-high" />
            </div>
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-surface-container-high" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-container-high" />
        </div>
      ))}
    </div>
  )
}

function LugarCardCompacta({ lugar }) {
  const fallback = imgPlaceholder(lugar.id_lugar, 240, 240)
  return (
    <Link
      to={`/lugares/${lugar.id_lugar}`}
      className="group flex gap-4 rounded-xl border border-outline-variant bg-white p-3 transition-all duration-300 hover:shadow-lg"
    >
      <div className="size-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <img
          src={lugar.imagen_url || fallback}
          alt={lugar.nombre}
          className="h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
          }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              {lugar.categoria?.nombre ?? 'Lugar'}
            </span>
            <BotonFavorito idLugar={lugar.id_lugar} />
          </div>
          <h4 className="mt-1 text-sm font-semibold">{lugar.nombre}</h4>
          <div className="mt-1 flex items-center gap-1 text-xs text-outline">
            <Icon name="location_on" size="sm" />
            {lugar.comuna}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[11px] font-semibold',
              lugar.es_gratuito
                ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                : 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
            )}
          >
            {formatPrecio(0, lugar.es_gratuito)}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-secondary">
            Ver más <Icon name="chevron_right" size="sm" />
          </span>
        </div>
      </div>
    </Link>
  )
}
