import { NextResponse } from 'next/server'
import axios from 'axios'

export const GET = async () => {
    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/feeds/accounts-list`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
            },
        })
        return NextResponse.json(response.data, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error?.response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
