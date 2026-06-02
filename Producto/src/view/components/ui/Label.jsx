import { cn } from '@/core/utils'

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-sm font-medium text-slate-700', className)}
      {...props}
    />
  )
}
