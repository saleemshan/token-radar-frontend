import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { chain: string; tokenAddress: string } },
) => {
  const { chain, tokenAddress } = context.params;

  if (!chain || !tokenAddress) {
    return NextResponse.json(
      { error: 'Chain ID and token address are required' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/sniper-info/${tokenAddress}`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
          'Content-Type': 'application/json',
        },
      },
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);

      const status = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.message || 'Internal server error';

      return NextResponse.json({ error: errorMessage }, { status });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};
