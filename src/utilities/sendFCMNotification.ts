import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { getMessaging } from 'firebase-admin/messaging'
import { cert, initializeApp, getApps, type ServiceAccount } from 'firebase-admin/app'

type NotificationData = {
  id?: string
  title: string
  body: string
  imageUrl?: string
  link?: string
}

type SendFCMNotificationParams = {
  tokens: string[]
  notification: NotificationData
}

// Credentials resolve lazily (at send time, never at import/build time):
// 1. FIREBASE_SERVICE_ACCOUNT env var (inline JSON — CI + server .env), else
// 2. serviceAccountKey.json at the repo root (local dev only — gitignored,
//    forbidden by mcp-rules.json, never committed).
async function loadServiceAccount(): Promise<ServiceAccount> {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT
  if (inline) {
    return JSON.parse(inline) as ServiceAccount
  }
  const raw = await readFile(path.join(process.cwd(), 'serviceAccountKey.json'), 'utf8')
  return JSON.parse(raw) as ServiceAccount
}

// Initialize Firebase Admin on first use. Missing credentials throw a clear
// error only when a notification is actually sent — builds and boots stay green.
async function ensureFirebaseAdmin(): Promise<void> {
  if (!getApps().length) {
    initializeApp({ credential: cert(await loadServiceAccount()) })
  }
}

export const sendFCMNotification = async ({
  tokens,
  notification,
}: SendFCMNotificationParams): Promise<void> => {
  try {
    if (!tokens.length) {
      console.log('No FCM tokens provided')
      return
    }

    await ensureFirebaseAdmin()
    const messaging = getMessaging()
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        link: notification.link || '',
      },
      tokens,
    }

    const response = await messaging.sendEachForMulticast(message)

    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => (resp.success ? null : tokens[idx]))
        .filter((token): token is string => token !== null)

      console.error('Failed to send notifications to tokens:', failedTokens)
    }

    console.log(
      `Successfully sent ${response.successCount} notifications, failed: ${response.failureCount}`,
    )
  } catch (error) {
    console.error('Error sending FCM notification:', error)
    throw error
  }
}
export const sendFCMTopicNotification = async ({
  topic,
  notification,
}: {
  topic: string
  notification: NotificationData
}): Promise<void> => {
  try {
    if (!topic) {
      console.log('No topic provided')
      return
    }

    await ensureFirebaseAdmin()
    const messaging = getMessaging()
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        link: notification.link || '',
        topic: topic,
        id: notification.id?.toString() || '',
      },
      topic,
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
  } catch (error) {
    console.error('Error sending FCM topic notification:', error)
    throw error
  }
}
