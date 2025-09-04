import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'
import * as Sentry from '@sentry/nextjs'

export const POST = async (request: NextRequest) => {
    const user = await getPrivyUser()
    const { referrerCode, user: privyUser } = await request.json()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const response = await axios.post(
            `${process.env.USER_BACKEND_API_URL}/user/profile`,
            {
                user: {
                    privyId: user?.userId,
                    ...privyUser,
                },
                referrerCode: referrerCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'x-api-key': process.env.USER_BACKEND_API_KEY!,
                },
            }
        )
        // console.log('user update', response.data);

        return NextResponse.json({ data: response.data }, { status: 200 })
    } catch (error) {
        Sentry.setTag('user_update_status', 'failed')
        Sentry.captureException(error)
        console.log('USER PROFILE FAILED')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log((error as any).response.data)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
