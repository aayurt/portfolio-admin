import type { CollectionConfig } from 'payload'

export const Abouts: CollectionConfig = {
  slug: 'about',
  admin: {
    group: "Tenants"
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
