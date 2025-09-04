import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'
import * as Sentry from '@sentry/nextjs'

export const GET = async (request: NextRequest) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') ?? 1
    const limit = searchParams.get('limit') ?? 10
    const isPerps = searchParams.get('isPerps') ?? false

    try {
        const { data } = await axios.get(`${process.env.BACKEND_API_URL}/ats/${user.userId}/list`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                Authorization: `Bearer ${user.accessToken}`,
            },
            params: {
                page,
                limit,
                isPerps,
            },
        })
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
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

    Sentry.setUser({ id: user.userId })

    const searchParams = request.nextUrl.searchParams
    const isPerps = searchParams.get('isPerps') ?? false
    const body = await request.json()

    try {
        const response = await axios.post(
            `${process.env.BACKEND_API_URL}/ats/${user.userId}`,
            {
                privyId: user.userId,
                ...body,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'x-api-key': process.env.BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
                params: {
                    isPerps,
                },
            }
        )

        // console.log(response)
        return NextResponse.json({ message: response.data }, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error?.response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
