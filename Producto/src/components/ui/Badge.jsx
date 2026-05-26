import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-surface-container-high text-on-surface-variant',
        brand: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        success: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        warning: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
        danger: 'bg-error-container text-on-error-container',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
