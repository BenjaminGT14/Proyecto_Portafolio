import { cn } from '@/core/utils'

export function Label({ className, htmlFor, children, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  )
}
