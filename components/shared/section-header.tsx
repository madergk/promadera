import { cn } from '@/lib/utils'

type Level = 'h2' | 'h3'
type Size = 'lg' | 'md'

interface Props {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  align?: 'left' | 'center'
  /** Nivel semántico del título. h2 para secciones, h3 para subsecciones. */
  as?: Level
  /** Escala visual, independiente del nivel semántico. */
  size?: Size
}

const sizeClass: Record<Size, string> = {
  lg: 'text-display-lg',
  md: 'text-display-md',
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  align = 'left',
  as = 'h2',
  size,
}: Props) {
  const Heading = as
  const resolvedSize: Size = size ?? (as === 'h3' ? 'md' : 'lg')

  return (
    <div
      className={cn(
        'mb-[clamp(2rem,1.4rem+3vw,4rem)] max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="text-eyebrow mb-[clamp(0.75rem,0.55rem+1vw,1.25rem)] text-primary">
          {eyebrow}
        </p>
      )}
      <Heading className={`text-balance text-foreground ${sizeClass[resolvedSize]}`}>
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            'text-body-lg mt-[clamp(1rem,0.75rem+1.2vw,1.75rem)] max-w-2xl text-pretty text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
