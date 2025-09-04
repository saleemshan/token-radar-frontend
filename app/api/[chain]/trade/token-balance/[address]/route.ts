import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async (request: NextRequest, context: { params: { address: string; chain: string } }) => {
    const tokenAddress = context.params.address
    const chain = context.params.chain
    const user = await getPrivyUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!tokenAddress) {
        return NextResponse.json({ error: 'Address is required' }, { status: 404 })
    }

    const params = {
        privyUserId: user.userId,
        chain: chain,
        tokenAddress: tokenAddress,
    }

    try {
        const response = await axios.get(`${process.env.IGNAS_BACKEND_API_URL}/health/get-token-balance`, {
            headers: {
                'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
            },
            params: params,
        })

        // console.log(tokenAddress, response.data)

        return NextResponse.json({ data: response.data }, { status: 200 })
    } catch (error) {
        console.log(
            'Error fetching single token balance:',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.data
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
