import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist } from 'serwist'
// import { ExpirationPlugin } from 'serwist'
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        // Change this attribute's name to your `injectionPoint`.
        // `injectionPoint` is an InjectManifest option.
        // See https://serwist.pages.dev/docs/build/configuring
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
    }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        ...defaultCache,
        {
            matcher: ({ request }) => request.mode === 'navigate',
            handler: new NetworkFirst({
                cacheName: 'pages',
            }),
        },
        {
            matcher: ({ request }) =>
                request.destination === 'image' ||
                request.destination === 'font' ||
                request.destination === 'video' ||
                request.destination === 'audio' ||
                request.destination === 'script' ||
                request.destination === 'style',
            handler: new CacheFirst({
                cacheName: 'static-assets',
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 60,
                        maxAgeSeconds: 15 * 24 * 60 * 60, // Cache for 15 Days
                    }),
                ],
            }),
        },
        // {
        //     matcher: ({ request }) => request.url.startsWith('/api/'),
        //     handler: new StaleWhileRevalidate({
        //         cacheName: 'api-calls',
        //         plugins: [
        //             new ExpirationPlugin({
        //                 maxEntries: 30,
        //                 maxAgeSeconds: 15 * 24 * 60 * 60, // Cache for 15 Days
        //             }),
        //         ],
        //     }),
        // },
    ],
    disableDevLogs: true,
    fallbacks: {
        entries: [
            {
                url: '/~offline',
                matcher({ request }: { request: Request }) {
                    return request.destination === 'document'
                },
            },
        ],
    },
})

serwist.addEventListeners()

//=============================================================================
// Event Listner
//=============================================================================

//Precache
const urlsToPrecache = ['/', '/points'] as const

self.addEventListener('install', event => {
    const requestPromises = Promise.all(
        urlsToPrecache.map(entry => {
            return serwist.handleRequest({ request: new Request(entry), event })
        })
    )

    event.waitUntil(requestPromises)
})

// Push notification event listener
self.addEventListener('push', event => {
    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('[Push Notification]: Incoming push event')

    if (!event.data) return

    try {
        const data = event.data.json()
        const options = {
            body: data.body || 'New notification',
            icon: '/favicons/web-app-manifest-192x192.png',
            badge: '/favicons/favicon-48x48.png',
            data: data.data || {},
            actions: data.actions || [],
            tag: data.tag || 'default',
            renotify: data.renotify || false,
            silent: data.silent || false,
            vibrate: data.vibrate || undefined,
        }
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('[Push Notification]:', options)

        event.waitUntil(
            self.registration
                .showNotification(data.title || 'Notification', options)
                .then(() => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('[Push Notification]: Notification shown')
                })
                .catch(error => {
                    console.error('Notification error:', error)
                })
        )
    } catch (error) {
        console.error('[Push Notification]: Error showing notification:', error)
    }
})

// Notification click event listener
self.addEventListener('notificationclick', event => {
    event.notification.close()

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            const url = event.notification.data?.url || '/'

            for (const client of clientList) {
                // check if the client URL starts with the target
                if (client.url.startsWith(url) && 'focus' in client) {
                    return client.focus()
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(url)
            }
        })
    )
})
