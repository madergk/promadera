import Image from 'next/image'

/**
 * Hero estándar de páginas internas. Se renderiza dentro de <main class="pt-20">,
 * por lo que anula ese padding con -mt-20 para quedar a sangre bajo el header.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  image,
  imageAlt = '',
  priority = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  imageAlt?: string
  priority?: boolean
}) {
  const hasImage = Boolean(image)
  const textColor = hasImage ? 'text-on-media' : 'text-foreground'
  const eyebrowColor = hasImage ? 'text-on-media-muted/90' : 'text-primary'
  const descriptionColor = hasImage ? 'text-on-media-muted/80' : 'text-muted-foreground'

  return (
    <section
      className={`hero-section relative -mt-20 flex h-screen flex-col justify-end overflow-hidden border-b border-border md:h-[90vh] ${
        hasImage ? '' : 'bg-gradient-warm'
      }`}
    >
      {hasImage && (
        <>
          <div className="hero-media absolute inset-0">
            <Image
              src={image as string}
              alt={imageAlt}
              fill
              priority={priority}
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="hero-overlay" />
          <div className="hero-vignette" />
          <div className="hero-grain" />
        </>
      )}
      <div className="container-wide relative z-10 pb-16 md:pb-24">
        {eyebrow && <p className={`text-eyebrow ${eyebrowColor} mb-5 font-medium`}>{eyebrow}</p>}
        <h1
          className={`max-w-4xl text-balance font-display text-5xl leading-[1.02] ${textColor} md:text-6xl lg:text-7xl`}
        >
          {title}
        </h1>
        {description && (
          <p className={`mt-8 max-w-2xl text-pretty text-lg leading-relaxed ${descriptionColor} md:text-xl`}>
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
