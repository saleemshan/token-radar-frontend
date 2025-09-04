import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const GET = async (request: NextRequest, context: { params: { chain: string } }) => {
    const searchParams = request.nextUrl.searchParams
    const chain = context.params.chain
    const walletAddress = searchParams.get('walletAddress')
    const tokenAddress = searchParams.get('tokenAddress')

    console.log({ chain, walletAddress, tokenAddress })

    if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address is required' }, { status: 404 })
    }
    if (!chain) {
        return NextResponse.json({ error: 'Chain is required' }, { status: 404 })
    }
    if (!tokenAddress) {
        return NextResponse.json({ error: 'Token address is required' }, { status: 404 })
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/${chain}/wallet-stats/${walletAddress}/${tokenAddress}`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
            },
        })

        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        console.log(
            'Error fetching single token from Vincent endpoint:',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.data
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
