import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const chainIds = searchParams.get('chainIds');
  const term = searchParams.get('term');
  try {
    const response = await axios.get(
      `${process.env.BRIDGE_API_URL}/relay/currencies`,
      {
        headers: {
          'x-api-key': process.env.BRIDGE_API_KEY!,
        },
        params: {
          chainIds,
          term,
        },
      },
    );

    return NextResponse.json(response.data.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
