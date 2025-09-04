import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { chain: string; pairAddress: string } },
) => {
  const { chain, pairAddress } = context.params;
  const quoteToken = request.nextUrl.searchParams.get('quote_token');

  if (!chain || !pairAddress) {
    return NextResponse.json(
      { error: 'Chain ID and pair address are required' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/detailed-stats/${pairAddress}`,
      {
        params: {
          quote_token: quoteToken,
        },
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
