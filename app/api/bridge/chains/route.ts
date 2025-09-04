import { NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async () => {
  try {
    const response = await axios.get(
      `${process.env.BRIDGE_API_URL}/relay/chains`,
      {
        headers: {
          'x-api-key': process.env.BRIDGE_API_KEY!,
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
