import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'

import { anyone } from '../access/anyone'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import { setCookieBasedOnDomain } from './Users/hooks/setCookieBasedOnDomain'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: anyone,
    update: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload.
    // NOTE: never derive from import.meta.url — in standalone builds Next inlines the build machine's absolute
    // path into fileURLToPath(import.meta.url), which 500s media routes on the server. process.cwd() is a safe
    // fallback in dev, but standalone server.js also chdir()s into .next/standalone, so production should set
    // MEDIA_STATIC_DIR explicitly (the deploy script writes it into the server .env).
    staticDir: process.env.MEDIA_STATIC_DIR || path.resolve(process.cwd(), 'public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  // hooks: {
  //   afterLogin: [setCookieBasedOnDomain],
  //   beforeChange: [
  //     async ({ req, data }) => {
  //       if (req.user?.tenant) {
  //         return {
  //           ...data,
  //           tenant: req.user.tenant,
  //         }
  //       }
  //       return data
  //     },
  //   ],
  // },
}
