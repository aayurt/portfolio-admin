import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import type { CollectionConfig } from 'payload'

export const Abouts: CollectionConfig = {
  slug: 'abouts',
  admin: {
    group: "Tenants"
  },
  access: {
    create: () => true,
    delete: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'intro',
      type: 'richText',
    },
    {
      name: 'skills',
      type: 'array',
      fields: [
        {
          name: 'skill',
          type: 'text',
        },
      ],
    },
    {
      name: 'workExperience',
      type: 'array',
      fields: [
        {
          name: 'company',
          type: 'text',
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'period',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'education',
      type: 'array',
      fields: [
        {
          name: 'institution',
          type: 'text',
        },
        {
          name: 'degree',
          type: 'text',
        },
        {
          name: 'period',
          type: 'text',
        },
      ],
    },
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
        const abouts = await req.payload.find({
          collection: 'abouts',
          where: {
            tenant: {
              equals: getTenant.docs[0]?.id,
            },
          },
        })
        if (!abouts.docs.length) {
          return Response.json([], { status: 200 })
        }
        return Response.json(abouts.docs, { status: 200 })
      },
    },
  ]
}
