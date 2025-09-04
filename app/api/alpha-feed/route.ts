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
        const { data } = await axios.get(`${process.env.BACKEND_API_URL}/all/alpha-feed/preferences`, {
            params: {
                privyId: user.userId,
            },
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
        })

        // console.log(data)
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

    const body = await request.json()

    try {
        const twitterAccounts = Array.isArray(body?.twitterAccounts) && body.twitterAccounts.length > 0 ? body.twitterAccounts.join(',') : ''

        const twitterLists = Array.isArray(body?.twitterLists) && body.twitterLists.length > 0 ? body.twitterLists.join(',') : ''

        const payload = {
            privyId: user.userId,
            showDefaultDataSources: body.showDefaultDataSources,
            twitterAccounts,
            twitterLists,
        }

        const headers = {
            Authorization: `Bearer ${user.accessToken}`,
            'x-api-key': process.env.BACKEND_API_KEY!,
            'Content-Type': 'application/json',
        }

        const { data } = await axios.post(`${process.env.BACKEND_API_URL}/all/alpha-feed/preferences`, payload, { headers })

        // console.log(data)
        return NextResponse.json(data, { status: 200 })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error?.response)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error }, { status })
    }
}
