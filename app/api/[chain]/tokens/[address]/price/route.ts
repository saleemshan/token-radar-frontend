import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { address: string; chain: string } },
) => {
  const chain = context.params.chain;
  const tokenAddress = context.params.address;

  if (!tokenAddress) {
    return NextResponse.json({ error: 'Address is required' }, { status: 404 });
  }

  const params = {
    tokenAddress: tokenAddress,
    tokenId: tokenAddress,
    chain: chain,
    privyUserId: 'privyUserId',
  };

  try {
    const response = await axios.get(
      `${process.env.IGNAS_BACKEND_API_URL}/health/get-token-price`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
        params: params,
      },
    );

    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;

    return NextResponse.json({ error: error }, { status });
  }
};
