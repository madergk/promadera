import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // El typecheck real corre aparte con `npm run typecheck`.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Uploads servidos desde Vercel Blob.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
