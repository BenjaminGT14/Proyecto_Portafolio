import { lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'

const MapaReal = lazy(() => import('./Mapa').then((m) => ({ default: m.Mapa })))

export function MapaLazy({ altura = 'h-96', ...props }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'animate-pulse rounded-xl bg-surface-container-high',
            altura,
          )}
        />
      }
    >
      <MapaReal altura={altura} {...props} />
    </Suspense>
  )
}
