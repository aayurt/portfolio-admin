import type { CollectionBeforeChangeHook } from 'payload'

type EventTicket = {
  id: string
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  numberOfTickets: number
  status: 'pending' | 'approved' | 'rejected'
  respondedAt: string | null
  notes?: string
  adminNotes?: string
}

interface BeforeChangeData {
  status?: 'pending' | 'approved' | 'rejected'
  respondedAt?: string | null
}

export const setRespondedAt: CollectionBeforeChangeHook<EventTicket> = async ({
  data,
  originalDoc,
}: {
  data: BeforeChangeData
  originalDoc?: EventTicket
}) => {
  if (originalDoc?.status === 'pending' && data.status && data.status !== 'pending') {
    return {
      ...data,
      respondedAt: new Date().toISOString(),
    }
  }

  return data
}
