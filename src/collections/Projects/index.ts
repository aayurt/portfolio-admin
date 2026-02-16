import type { CollectionConfig } from 'payload'
import { updateAndDeleteAccess } from '../Tenants/access/updateAndDelete'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'client',
      type: 'text',
      label: 'Client/Company',
    },
    {
      name: 'role',
      type: 'text',
    },
    {
      name: 'timeframe',
      type: 'text',
    },
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
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
        const projects = await req.payload.find({
          collection: 'projects',
          where: {
            tenant: {
              equals: getTenant.docs[0]?.id,
            },
          },
        })
        return Response.json(projects.docs, { status: 200 })
      },
    },
  ]
}
