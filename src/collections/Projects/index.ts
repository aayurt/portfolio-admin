import type { CollectionConfig } from 'payload'
import { updateAndDeleteAccess } from '../Tenants/access/updateAndDelete'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

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
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
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
          depth: 0,
          where: {
            tenant: {
              equals: getTenant.docs[0]?.id,
            },
          },
        })
        return Response.json(projects.docs, { status: 200 })
      },
    },
    {
      path: '/by-slug/:tenant/:slug',
      method: 'get',
      handler: async (req) => {
        const tenantSlug = req.routeParams?.tenant as string
        const docSlug = req.routeParams?.slug as string
        const getTenant = await req.payload.find({
          collection: 'tenants',
          where: { slug: { equals: tenantSlug } },
          limit: 1,
        })
        if (getTenant.docs.length === 0) {
          return Response.json({ message: 'Tenant not found' }, { status: 404 })
        }
        const project = await req.payload.find({
          collection: 'projects',
          depth: 1,
          where: {
            tenant: { equals: getTenant.docs[0]?.id },
            slug: { equals: docSlug },
          },
          limit: 1,
        })
        if (!project.docs.length) {
          return Response.json({ message: 'Project not found' }, { status: 404 })
        }
        return Response.json(project.docs[0], { status: 200 })
      },
    },
  ]
}
