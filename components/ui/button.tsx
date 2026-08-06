import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium uppercase transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-primary/30 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'text-foreground hover:bg-muted',
        link: 'text-primary normal-case underline-offset-4 hover:underline',
        hero: 'bg-background text-primary shadow-elevated hover:bg-secondary hover:text-secondary-foreground',
        'outline-light':
          'border border-background/40 bg-transparent text-background backdrop-blur-sm hover:bg-background hover:text-primary',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
      },
      size: {
        default:
          'h-auto min-h-[48px] px-6 py-3 leading-none tracking-[0.06em] md:h-11 md:min-h-0 md:px-6 md:py-2',
        sm: 'h-auto min-h-[44px] px-5 py-2.5 text-xs leading-none tracking-[0.08em] md:h-9 md:min-h-0 md:px-4 md:py-2',
        lg: 'h-auto min-h-[52px] px-7 py-3.5 text-sm leading-none tracking-[0.05em] md:h-14 md:px-8 md:py-0 md:text-base',
        icon: 'h-12 w-12 leading-none tracking-[0.06em] md:h-10 md:w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
