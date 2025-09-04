import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';
// import axios from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { address: string; chain: string } },
) => {
  const chain = context.params.chain;
  const address = context.params.address;
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    // fetch data
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/tradingview/social-mentions?token_ca=${address}`,
      {
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
      },
    );
    return NextResponse.json(response.data.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;

    return NextResponse.json({ error: 'Error fetching data' }, { status });
  }
};
