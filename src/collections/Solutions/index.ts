import type { CollectionConfig } from 'payload'

import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import { slugField } from '@/fields/slug'

export const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: {
    useAsTitle: 'title',
    group: 'Tenants',
    defaultColumns: ['title', 'subtitle', 'updatedAt'],
    description: 'Solution offerings shown in the Solutions carousel. Add as many as you like.',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
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
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Category tag shown on the card, e.g. "AI/ML Automation"',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: {
        description: 'One-sentence summary shown on the card.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Longer description shown on the card.',
      },
    },
    {
      name: 'metrics',
      type: 'array',
      admin: {
        description: 'Quantified impact metrics, e.g. value "90%+" with label "User adoption"',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      admin: {
        description: 'Key capabilities, each a bold title plus one-line description',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'benefits',
      type: 'array',
      admin: {
        description: 'Outcome-oriented, quantified bullets',
      },
      fields: [
        {
          name: 'benefit',
          type: 'text',
        },
      ],
    },
    {
      name: 'techStack',
      type: 'array',
      admin: {
        description: 'Technologies used, e.g. Next.js, Payload CMS, PostgreSQL',
      },
      fields: [
        {
          name: 'tech',
          type: 'text',
        },
      ],
    },
    {
      name: 'links',
      type: 'group',
      fields: [
        {
          name: 'liveUrl',
          type: 'text',
          label: 'Live demo URL',
        },
        {
          name: 'repoUrl',
          type: 'text',
          label: 'Source/repo URL',
        },
      ],
    },
    ...slugField(),
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
          return Response.json({ message: 'Tenant not found' }, { status: 404 })
        }
        const solutions = await req.payload.find({
          collection: 'solutions',
          depth: 2,
          where: {
            tenant: {
              equals: getTenant.docs[0]?.id,
            },
          },
        })
        return Response.json(solutions.docs, { status: 200 })
      },
    },
  ],
}
