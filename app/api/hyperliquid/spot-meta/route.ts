import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/hyperliquid/spot-meta`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_URL!,
          'Content-Type': 'application/json',
        },
      },
    );
    return NextResponse.json(response.data, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Determine if error is an axios error with response
    const isAxiosError = error?.response !== undefined;
    const status = isAxiosError ? error.response.status : 500;
    const errorMessage = isAxiosError
      ? error.response.data?.error || error.message
      : error.message || 'Internal server error';

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
