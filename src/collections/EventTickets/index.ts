import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/access/superAdminOrTenantAdmin'
import { setRespondedAt } from './hooks/setRespondedAt'

interface AdminData {
  status?: 'pending' | 'approved' | 'rejected'
}

export const EventTickets: CollectionConfig = {
  slug: 'event-tickets',
  admin: {
    useAsTitle: 'id',
    group: 'Events',
    defaultColumns: ['eventId', 'firstName', 'lastName', 'status', 'appliedAt'],
  },
  access: {
    create: () => true,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'eventId',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'contactNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'numberOfTickets',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'appliedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      defaultValue: () => new Date(),
      required: true,
    },
    {
      name: 'respondedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data: AdminData) => data.status !== 'pending',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Additional Notes',
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Admin notes or rejection reason',
        condition: (data: AdminData) => data.status !== 'pending',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [setRespondedAt],
  },
}
