import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { chain: string } },
) => {
  const searchParams = request.nextUrl.searchParams;
  const chain = context.params.chain;
  const interval = searchParams.get('interval') ?? '24h';

  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/trending`,
      {
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
        params: {
          time_frame: interval,
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
