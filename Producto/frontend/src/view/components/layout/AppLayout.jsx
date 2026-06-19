import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

const FULL_BLEED_ROUTES = ['/'] // rutas que manejan su propio padding interno

export function AppLayout() {
  const location = useLocation()
  const fullBleed = FULL_BLEED_ROUTES.includes(location.pathname)

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main
        className={
          fullBleed
            ? 'flex-1'
            : 'mx-auto w-full max-w-7xl flex-1 px-4 pt-32 pb-12 sm:px-6 md:pt-28 xl:max-w-[1440px] xl:px-10'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
