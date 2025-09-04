import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'
import * as Sentry from '@sentry/nextjs'

export const POST = async (request: NextRequest) => {
    const user = await getPrivyUser()
    const { newReferCode } = await request.json()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const response = await axios.post(
            `${process.env.REFERRAL_BACKEND_API_URL}/user/${user.userId}/refer-code`,
            {
                newReferCode: newReferCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'x-api-key': process.env.REFERRAL_BACKEND_API_KEY!,
                },
            }
        )
        // console.log('update referral code', response.data)

        if (response.data.code !== 0) {
            if (response.data.code === 6016803003) {
                throw new Error('Referral code already exists.')
            }
            throw new Error('Something went wrong, try again.')
        }

        return NextResponse.json({ data: response.data }, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        Sentry.setTag('referral_update_code_status', 'failed')
        Sentry.captureException(error)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error.message ?? 'Something went wrong, try again.' }, { status })
    }
}
