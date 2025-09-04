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

    const { isPublic } = await request.json()
    const apiUrl = `${process.env.BACKEND_API_URL}/ats/${user.userId}/${strategyId}/${isPublic ? 'private' : 'public'}`

    try {
        const { data } = await axios.post(
            apiUrl,
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

        // console.log(data)
        return NextResponse.json({ message: data }, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
