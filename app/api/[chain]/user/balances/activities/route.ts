import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const maxDuration = 30

export const GET = async (request: NextRequest, context: { params: { chain: string } }) => {
    const chain = context.params.chain
    const user = await getPrivyUser()
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') ?? 20

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // return NextResponse.json({ body: undefined }, { status: 200 });
    }

    try {
        const response = await axios.get(
            `${process.env.IGNAS_BACKEND_API_URL}/health/get-wallet-activities?privyUserId=${user.userId}&chain=${chain}&limit=${limit}`,
            {
                headers: {
                    'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
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
