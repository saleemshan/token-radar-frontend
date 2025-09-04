import { NextResponse } from 'next/server';
import axios from 'axios';

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const response = await axios.post(
      `${process.env.BRIDGE_API_URL}/relay/price`,
      body,
      {
        headers: {
          'x-api-key': process.env.BRIDGE_API_KEY!,
          'Content-Type': 'application/json',
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
