import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const POST = async (request: NextRequest) => {
    const user = await getPrivyUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    try {
        const response = await axios.post(
            `${process.env.USER_BACKEND_API_URL}/users/details`,
            {
                ...body,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'x-api-key': process.env.USER_BACKEND_API_KEY!,
                },
            }
        )

        return NextResponse.json({ data: response.data }, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
