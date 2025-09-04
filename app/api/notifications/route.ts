import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'
// import * as Sentry from '@sentry/nextjs';

export const GET = async () => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data } = await axios.get(`${process.env.BACKEND_API_URL}/webpush/${user.userId}/preferences`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
        })
        return NextResponse.json(data, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error?.response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}

export const POST = async (request: NextRequest) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscription, preferences, deleteSubscription, fingerprint } = await request.json()
    if (!subscription && !deleteSubscription) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const endpoint = `${process.env.BACKEND_API_URL}/webpush/${user.userId}/${deleteSubscription ? 'unsubscribe' : 'subscribe'}`

    const payload = {
        subscription: deleteSubscription ? { ...deleteSubscription, fingerprint } : { ...subscription, fingerprint },
        preferences,
        fingerprint,
    }

    const headers = {
        Authorization: `Bearer ${user.accessToken}`,
        'x-api-key': process.env.BACKEND_API_KEY!,
        'Content-Type': 'application/json',
    }

    try {
        const { data } = await axios.post(endpoint, payload, { headers })
        return NextResponse.json(data, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error?.response?.data)
        const status = error?.response?.status || 500
        return NextResponse.json({ error }, { status })
    }
}
