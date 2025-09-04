import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const timeFrame = searchParams.get('timeFrame');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Invalid request, Symbol is required' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/lnc/charts`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
        },
        params: {
          symbol: symbol,
          timeFrame: timeFrame ?? 'day',
        },
      },
    );

    // console.log(response.data);

    return NextResponse.json(response.data, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
