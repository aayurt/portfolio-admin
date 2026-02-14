import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      ...[
        NEXT_PUBLIC_SERVER_URL,

        /* 'https://example.com' */
      ].map((item) => {
        const url = new URL(item)
        // Remove trailing slash if it exists

        return {
          hostname: `${url.hostname}`,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,

  // async rewrites() {
  //   return {
  //     beforeFiles: [
  //       {
  //         source: '/:path*',
  //         has: [
  //           {
  //             type: 'host',
  //             value: '(?<subdomain>[^.]+).localhost:3000',
  //           },
  //         ],
  //         destination: '/tenant-domains/:subdomain/:path*',
  //       },
  //       // Add production domain pattern
  //       {
  //         source: '/:path*',
  //         has: [
  //           {
  //             type: 'host',
  //             value: '(?<subdomain>[^.]+).yourdomain.com',
  //           },
  //         ],
  //         destination: '/tenant-domains/:subdomain/:path*',
  //       },
  //     ],
  //   }
  // },
}

export default withPayload(nextConfig)
