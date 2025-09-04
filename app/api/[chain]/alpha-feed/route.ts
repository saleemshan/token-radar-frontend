import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams
    const user = await getPrivyUser()
    const chain = searchParams.get('chain')

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/all/alpha-feed`, {
            params: {
                chain: chain ?? 'solana',
                privyUserId: user?.userId ?? '',
                privyId: user?.userId ?? '',
            },
            headers: {
                'x-api-key': `${process.env.BACKEND_API_KEY}`,
            },
        })

        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log((error as any).response.data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
