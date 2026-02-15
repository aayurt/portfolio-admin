import type { CollectionConfig } from 'payload'
import { updateAndDeleteAccess } from '../Tenants/access/updateAndDelete'

export const Abouts: CollectionConfig = {
  slug: 'abouts',
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
}
