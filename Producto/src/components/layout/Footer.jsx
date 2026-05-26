import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'Explorar',
    items: [
      { label: 'Lugares', to: '/lugares' },
      { label: 'Eventos', to: '/eventos' },
      { label: 'Mapa', to: '/mapa' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Aviso Legal', to: '#' },
      { label: 'Política de Privacidad', to: '#' },
      { label: 'Cookies', to: '#' },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { label: 'Sobre el Proyecto', to: '#' },
      { label: 'Contacto', to: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="mb-4 block text-lg font-bold text-slate-900">Entreteca</span>
          <p className="text-sm leading-relaxed text-slate-500">
            © {new Date().getFullYear()} Entreteca. Inspiración y cultura en cada rincón.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Proyecto de título — Duoc UC San Joaquín.
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h5 className="mb-6 text-[10px] uppercase tracking-widest text-outline">
              {section.title}
            </h5>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="block text-sm leading-relaxed text-slate-500 transition-transform duration-200 hover:translate-x-1 hover:text-secondary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
