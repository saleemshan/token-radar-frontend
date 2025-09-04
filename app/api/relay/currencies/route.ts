import { NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const response = await axios.get(
      `${process.env.BRIDGE_API_URL}/relay/currencies`,
      {
        params: {
          chainIds: searchParams.get('chainIds'),
          defaultList: searchParams.get('defaultList'),
          limit: searchParams.get('limit'),
          depositAddressOnly: searchParams.get('depositAddressOnly'),
        },
        headers: {
          'x-api-key': process.env.BRIDGE_API_KEY!,
          'accept': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status }
    );
  }
};
