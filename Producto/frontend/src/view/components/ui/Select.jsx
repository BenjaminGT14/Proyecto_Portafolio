import { cn } from '@/core/utils'

// React 19: `ref` es una prop normal en componentes de función, ya no hace falta forwardRef.
export function Select({ className, children, ref, ...props }) {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
