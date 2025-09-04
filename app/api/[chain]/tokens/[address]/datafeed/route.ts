import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export const GET = async (
  request: NextRequest,
  context: { params: { address: string; chain: string } },
) => {
  const address = context.params.address;
  const chain = context.params.chain;
  const searchParams = request.nextUrl.searchParams;
  const toTimestamp = searchParams.get('endTime');
  const fromTimestamp = searchParams.get('startTime');
  const limit = searchParams.get('limit') ?? 500;
  // ['1m', '5m', '15m', '1h', '4h, 1d]
  const interval = searchParams.get('interval') ?? '1d';
  // const pairCa = searchParams.get('pairCa');
  const pairAddress = searchParams.get('pairAddress');
  const quote_token = searchParams.get('quoteToken');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }
  if (!pairAddress) {
    return NextResponse.json(
      { error: 'Token address is required' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `${
        process.env.BACKEND_API_URL
      }/${chain}/tradingview/kline?pair_ca=${pairAddress}&from_timestamp=${fromTimestamp}&to_timestamp=${toTimestamp}&limit=${limit}&kline_interval=${interval}&quote_token=${
        quote_token ?? 'token1'
      }`,
      {
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
      },
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;

    return NextResponse.json({ error: 'Error fetching data' }, { status });
  }
};
