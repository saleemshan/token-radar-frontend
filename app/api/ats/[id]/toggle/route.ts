import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const POST = async (request: NextRequest, context: { params: { id: string } }) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const strategyId = context.params.id
    if (!strategyId) {
        return NextResponse.json({ error: 'Id is required' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const isPerps = searchParams.get('isPerps') ?? false
    const body = await request.json()

    let url = ''

    if (!body.newState) {
        url = `${process.env.BACKEND_API_URL}/ats/${user.userId}/${strategyId}/run`
    } else {
        url = `${process.env.BACKEND_API_URL}/ats/${user.userId}/${strategyId}/stop`
    }

    try {
        const response = await axios.post(
            url,
            {},
            {
                headers: {
                    'x-api-key': process.env.BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                params: {
                    isPerps,
                },
            }
        )

        // console.log(response.data)
        return NextResponse.json({ message: response.data }, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
