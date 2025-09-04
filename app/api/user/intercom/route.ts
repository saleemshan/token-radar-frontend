import { NextResponse } from 'next/server'
import { getPrivyUser } from '@/utils/privyAuth'
import crypto from 'crypto'

export const GET = async () => {
    const user = await getPrivyUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!process.env.INTERCOM_SECRET_KEY) {
        return NextResponse.json({ error: 'Missing Intercom key' }, { status: 400 })
    }
    try {
        const hash = crypto.createHmac('sha256', process.env.INTERCOM_SECRET_KEY).update(user.userId).digest('hex')
        return NextResponse.json(hash, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
