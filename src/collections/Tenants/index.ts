import type { CollectionConfig } from 'payload'

import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { sendFCMTopicNotification } from '@/utilities/sendFCMNotification'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isSuperAdminAccess,
    delete: updateAndDeleteAccess,
    read: () => true,
    update: updateAndDeleteAccess,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Tenants',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req?.payload) {
          await sendFCMTopicNotification({
            topic: 'afno-app-tenant',
            notification: {
              title: doc.title,
              body: doc.description || 'Check out the ' + doc.title + ' restaurant.',
              imageUrl: doc.coverImage?.url,
              id: doc.id,
            },
          })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      required: false,
      admin: {
        description:
          'If checked, the tenant will be shown on the website. If not checked, the tenant will not be shown on the website.',
        position: 'sidebar',
      },
    },
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          // required: true,
        },
        {
          name: 'email',
          type: 'email',
          // required: true,
        },
      ],
    },

    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Used for domain-based tenant handling',
      },
    },

    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Used for url paths, example: /tenant-slug/page-slug',
        position: 'sidebar',
      },
      index: true,
      required: true,
    },
    {
      name: 'allowPublicRead',
      type: 'checkbox',
      admin: {
        description:
          'If checked, logging in is not required to read. Useful for building public pages.',
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
        },
      ],
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'icon',
          type: 'text',
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'Facebook profile URL',
          },
        },
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'Instagram profile URL',
          },
        },
        {
          name: 'twitter',
          type: 'text',
          admin: {
            description: 'Twitter profile URL',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
        {
          name: 'github',
          type: 'text',
          admin: {
            description: 'Github profile URL',
          },
        },
      ],
    },
  ],
}
