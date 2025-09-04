import { getPrivyUser } from '@/utils/privyAuth';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, type, side, amount, price, params } = body;

    const user = await getPrivyUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/api/v1/hyperliquid/place-order`,
      {
        privyUserId: user.userId,
        symbol,
        type,
        side,
        amount,
        price,
        reduceOnly: params?.reduceOnly,
        timeInForce: params?.timeInForce,
        params,
      },
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
