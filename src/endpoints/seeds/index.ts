import { Tenant } from '@/payload-types'
import fs from 'fs'
import path from 'path'
import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload'


const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
  'tenants',
  'users',
  'projects',
]

const projects = [
  {

    title: "Afno App Mobile – Restaurant Discovery App",
    slug: "afno-app",
    description:
      "A cross-platform mobile app that helps users discover Nepalese restaurants, browse menus, and explore local food with a fast, intuitive experience.",
    timeframe: "2025-02-05T00:00:00.000Z",
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text:
                  "The Afno App Mobile app brings restaurant discovery to iOS and Android with a fast, native-like experience. Built with a single cross-platform codebase, the app focuses on smooth performance, simple navigation, and real-time data synced with the web platform."
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1
          }
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1
      }
    },
    client: "Afno App",
    role: "Full-Stack & Mobile Engineer",
    images: []
  },
  {
    title: "Afno App Web – Multi-tenant Restaurant Discovery Platform",
    slug: "afno",
    description:
      "A full-stack web platform helping users discover Nepalese restaurants while providing restaurants with powerful tools to manage menus, promotions, and operations.",
    _status: "published",
    timeframe: "2025-01-10T00:00:00.000Z",
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text:
                  "Afno App Web is a modern restaurant discovery and management platform focused on connecting users with Nepalese restaurants. It combines a fast, SEO-friendly public web experience with a powerful multi-tenant admin system."
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1
          }
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1
      }
    },
    client: "Afno App",
    role: "Full-Stack Engineer & Product Builder",
    images: []
  }
]

const medias = [
  {
    "alt": "Aayurt Shrestha",
    "url": "/images/avatar.jpg",
    "filename": "avatar.jpg"
  },
  {
    "alt": "Afno App Web Cover 1",
    "url": "/images/projects/afno/cover-01.png",
    "filename": "afno-cover-01.png"
  },
  {
    "alt": "Afno App Mobile Cover 1",
    "url": "/images/projects/afno-app/cover-01.png",
    "filename": "afno-app-cover-01.png"
  }
]
const globals: GlobalSlug[] = ['header', 'footer']

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info(`— Clearing collections and globals...`)

  // Clear globals
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {}, // Reset to empty/default if possible, or just overwrite later
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  // Clear collections
  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding Tenants...`)
  const [aayurtTenant, rujaTenant]: Tenant[] = await Promise.all([
    payload.create({
      collection: 'tenants',
      data: {
        name: 'Aayurt',
        slug: 'aayurt',
        domain: 'aayurt',
        location: "Asia/Kathmandu",
        contactInfo: {
          email: "aayurtshrestha@gmail.com",
          phone: "+977-9800000000"
        },
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          github: "",
        }
      },
      req,
    }),
    payload.create({
      collection: 'tenants',
      data: {
        name: 'Ruja',
        slug: 'ruja',
        domain: 'ruja',
        location: "Asia/Kathmandu",
        contactInfo: {
          email: "rj@gmail.com",
          phone: "+977-9800000000"
        },
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: ""
        }
      },
      req,
    }),
  ])
  payload.logger.info(`— Seeding Users...`)
  console.log("aayurtTenant-", aayurtTenant?.id)
  if (!aayurtTenant?.id) {
    throw new Error('Failed to seed aayurtTenant')
  }
  const nepaleseUser = await
    payload.create({
      collection: 'users',
      data: {
        name: 'Nepalese Bros',
        email: 'nepalesebros@gmail.com',
        password: 'Nepal@123',
        role: 'super-admin',
        tenant: aayurtTenant
      },
      req,
    })



  const mediaDocs: Record<string, any> = {}

  for (const media of medias) {
    const filePath = path.join(process.cwd(), 'public', media.url)
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath)
      const doc = await payload.create({
        collection: 'media',
        data: {
          alt: media.alt,
          tenant: aayurtTenant,
        },
        file: {
          data: fileBuffer,
          mimetype: media.filename.endsWith('png') ? 'image/png' : 'image/jpeg',
          name: media.filename,
          size: fileBuffer.length,
        },
        req,
      })
      mediaDocs[media.filename] = doc
    } else {
      payload.logger.warn(`File not found: ${filePath}`)
    }
  }

  // Seeding About
  // Using the first avatar image if available, or just a placeholder
  // The 'person' global needs an avatar ID.
  // In aayurtData.person, avatar is null or needs to be linked.

  const avatarDoc = mediaDocs['avatar.jpg']


  payload.logger.info(`— Seeding Aayurt Tenant Data...`)

  // Seeding Media


  // Seeding Projects
  for (const project of projects) {
    // Find project specific images if any, otherwise skip images for now or link generic
    // The seed data has no images defined in the array yet.
    // If we want to link the covers:
    let relatedImages = []
    if (project.slug === 'afno') {
      const cover = mediaDocs['afno-cover-01.png']
      if (cover) relatedImages.push(cover.id)
    } else if (project.slug === 'afno-app') {
      const cover = mediaDocs['afno-app-cover-01.png']
      if (cover) relatedImages.push(cover.id)
    }

    await payload.create({
      collection: 'projects',
      data: {
        ...project,
        tenant: aayurtTenant.id,
        images: relatedImages.length > 0 ? relatedImages : undefined,
      },
      req,
    })
  }

  payload.logger.info('Seeded database successfully!')
}

