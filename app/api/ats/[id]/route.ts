import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

//get individual ATS info
export const GET = async (request: NextRequest, context: { params: { id: string } }) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const strategyId = context.params.id
    const searchParams = request.nextUrl.searchParams
    const isPerps = searchParams.get('isPerps') ?? false

    try {
        const { data } = await axios.get(`${process.env.BACKEND_API_URL}/ats/${user.userId}/${strategyId}`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                Authorization: `Bearer ${user.accessToken}`,
            },
            params: {
                isPerps,
            },
        })

        // console.log(data)
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}

export const DELETE = async (request: NextRequest, context: { params: { id: string } }) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const strategyId = context.params.id
    const searchParams = request.nextUrl.searchParams
    const isPerps = searchParams.get('isPerps') ?? false

    try {
        const { data } = await axios.delete(`${process.env.BACKEND_API_URL}/ats/${user.userId}/${strategyId}`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                Authorization: `Bearer ${user.accessToken}`,
            },
            params: {
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

//update ATS
export const POST = async (request: NextRequest, context: { params: { id: string } }) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const strategyId = context.params.id
    if (!strategyId) {
        return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const isPerps = searchParams.get('isPerps') ?? false
    const body = await request.json()

    try {
        const { data } = await axios.post(
            `${process.env.BACKEND_API_URL}/ats/${user.userId}/${strategyId}`,
            {
                ...body,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'x-api-key': process.env.BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
                params: {
                    isPerps: isPerps === 'true',
                },
            }
        )

        // console.log(data)
        return NextResponse.json(data, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
