// lib/fingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs'

let visitorId: string | null = null

export const getVisitorId = async (): Promise<string> => {
    if (visitorId) return visitorId

    const fp = await FingerprintJS.load()
    const result = await fp.get()
    visitorId = result.visitorId
    return visitorId
}
