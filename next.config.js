import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

import redirects from './redirects.js'

// Pin the file-tracing root to THIS project. Without it, Next may infer a
// workspace root from a parent pnpm-lock.yaml and produce a broken
// standalone build (missing server.js / node_modules).
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
console.log('NEXT_PUBLIC_SERVER_URL:', NEXT_PUBLIC_SERVER_URL)
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: '/admin',
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
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
