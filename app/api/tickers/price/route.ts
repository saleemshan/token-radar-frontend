import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const tickers = searchParams.get('tickers');

  if (!tickers) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 404 });
  }

  const splitTickers = tickers.split(',');

  const queryStringArray = splitTickers.map((symbol) => `symbolList=${symbol}`);
  const queryString = queryStringArray.join('&');

  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/bn/price?${queryString}`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
        },
      },
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;

    return NextResponse.json({ error: error }, { status });
  }
};
