import { type CollectionConfig } from 'payload'

import { isAdmin } from '@/access/admin'
import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import { readAccess } from './access/read'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { externalUsersLogin } from './endpoints/externalUsersLogin'
import { setCookieBasedOnDomain } from './hooks/setCookieBasedOnDomain'

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  arrayFieldAccess: {},
  tenantFieldAccess: {},
  rowFields: [
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['tenant-viewer'],
      hasMany: true,
      options: ['tenant-admin', 'tenant-viewer'],
      required: true,
    },
  ],
})

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: () => true,
    delete: updateAndDeleteAccess,
    read: readAccess,
    update: updateAndDeleteAccess,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  endpoints: [externalUsersLogin],
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
      required: true,
      defaultValue: 'user',
      access: {
        create: ({ req }) => {
          return isAdmin({ req })
        },
        update: ({ req }) => {
          return Boolean(isSuperAdminAccess({ req }))
        },
      },
    },
    {
      ...defaultTenantArrayField,
      admin: {
        ...(defaultTenantArrayField?.admin || {}),
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterLogin: [setCookieBasedOnDomain],

    beforeChange: [
      async ({ data, req, operation }) => {
        if (!req.user) {
          data.role = 'user'
        }
        if (req.user && !(isAdmin({ req }) || isSuperAdminAccess({ req }))) {
          data.role = 'user'
        }
        if (operation === 'create') {
          // Only apply if tenants array is missing or empty
          if (!data.tenants || data.tenants.length === 0) {
            data.tenants = [
              {
                tenant: data.tenant,
                roles: ['tenant-viewer'], // or whatever default roles you want
              },
            ]
          }
        }
        return data
      },
    ],
  },
}
