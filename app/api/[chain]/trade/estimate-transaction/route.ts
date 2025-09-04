import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';

export const maxDuration = 60;

export const GET = async (request: NextRequest) => {
  const user = await getPrivyUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await axios.get(
      `${process.env.IGNAS_BACKEND_API_URL}/health/estimate-transaction`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
        params: {
          privyUserId: user.userId,
          chain: body.chain,
          fromAsset: body.fromAsset,
          tokenAddress: body.tokenAddress,
          amount: body.amount,
          priorityFee: body.priorityFee,
          slippageLimit: body.slippageLimit,
          action: body.action, //buy
          amountType: 'input', //keep
        },
      },
    );

    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
