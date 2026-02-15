import type { CollectionConfig } from 'payload'
import { updateAndDeleteAccess } from '../Tenants/access/updateAndDelete'

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  admin: {
    group: "Tenants"
  },
  access: {
    create: () => true,
    delete: updateAndDeleteAccess,
    read: () => true,
    update: updateAndDeleteAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    }

  ],
  endpoints: [
    {
      path: '/by-slug/:slug',
      method: 'get',

      handler: async (req) => {
        const slug = req.routeParams?.slug as string

        const getTenant = await req.payload.find({
          collection: 'tenants',
          where: {
            slug: {
              equals: slug,
            },
          },
          limit: 1,
        })
        if (getTenant.docs.length === 0) {
          return Response.json(
            { message: 'Tenant not found' },
            { status: 404 }
          )
        }
        const galleries = await req.payload.find({
          collection: 'galleries',
          where: {
            tenant: {
              equals: getTenant.docs[0]?.id,
            },
          },
        })
        if (!galleries.docs.length) {
          return Response.json([], { status: 200 })
        }
        return Response.json(galleries.docs, { status: 200 })
      },
    },
  ]
}
