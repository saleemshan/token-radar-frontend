import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export const GET = async (
  request: NextRequest,
  context: { params: { address: string; chain: string } },
) => {
  const address = context.params.address;
  const chain = context.params.chain;
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }
  try {
    console.log(`${process.env.BACKEND_API_URL}/${chain}/token/${address}`);

    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/token/${address}`,
      {
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
      },
    );

    // console.log(response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;

    return NextResponse.json({ error: 'Error fetching data' }, { status });
  }
};
