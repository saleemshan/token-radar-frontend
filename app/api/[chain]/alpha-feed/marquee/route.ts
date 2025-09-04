import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { chain: string } },
) => {
  const chain = context.params.chain;
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit');
  const minutes = searchParams.get('minutes');

  // if (!filter) {
  //   return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  // }

  try {
    const params: { limit?: string; minutes?: string } = {};
    if (limit) {
      params.limit = limit;
    }
    if (minutes) {
      params.minutes = minutes;
    }

    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/alpha-feed-marquee`,
      {
        params,
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
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
