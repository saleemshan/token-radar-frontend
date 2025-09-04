import { NextResponse } from 'next/server';
import { getPrivyUser } from '@/utils/privyAuth';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const user = await getPrivyUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.coin || !body.orderId) {
      return NextResponse.json(
        { error: 'Coin and orderId are required' },
        { status: 400 },
      );
    }

    const response = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/api/v1/hyperliquid/cancel-order`,
      { privyUserId: user.userId, coin: body.coin, orderId: body.orderId },
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
          'Content-Type': 'application/json',
        },
      },
    );
    return NextResponse.json(response.data, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const status = error.response?.status || 500;
    return NextResponse.json(
      { error: error.response?.data || 'Failed to cancel order' },
      { status },
    );
  }
}
