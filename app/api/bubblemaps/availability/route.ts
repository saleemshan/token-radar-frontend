import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get('chain');
  const token = searchParams.get('token');

  if (!chain || !token) {
    return NextResponse.json(
      { error: 'Invalid params, symbol and token are required' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(
      `https://api-legacy.bubblemaps.io/map-availability`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
        },
        params: {
          chain,
          token,
        },
      },
    );

    // console.log('Token Bubblemaps Availability', response.data);
    return NextResponse.json(response.data, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
