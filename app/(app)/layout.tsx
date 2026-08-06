import React from 'react'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import { TAGLINE } from '@/lib/brand'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const description =
  'El ecosistema digital de la construcción en madera: simulá costos y plazos, encontrá constructoras certificadas e informate antes de decidir. Corrientes, Argentina.'

export const metadata: Metadata = {
  title: {
    default: `PROMADERA — ${TAGLINE}`,
    template: '%s — PROMADERA',
  },
  description,
  applicationName: 'PROMADERA',
  authors: [{ name: 'PROMADERA S.A.S.' }],
  openGraph: {
    type: 'website',
    siteName: 'PROMADERA',
    locale: 'es_AR',
    title: `PROMADERA — ${TAGLINE}`,
    description,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport = {
  themeColor: '#2f7f50',
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          {/* pt-20 compensa el header fijo (h-20); el hero del home lo anula con -mt-20. */}
          <main className="flex-1 pt-20">{children}</main>
          <Footer />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
