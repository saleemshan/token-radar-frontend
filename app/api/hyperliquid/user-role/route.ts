import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.user || !/^0x[0-9a-fA-F]{40}$/.test(body.user)) {
      return NextResponse.json(
        { error: 'Invalid user address format' },
        { status: 400 },
      );
    }

    const response = await axios.post(
      `${process.env.BACKEND_API_URL}/hyperliquid/user-role`,
      { user: body.user },
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
          'Content-Type': 'application/json',
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
