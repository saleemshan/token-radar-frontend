import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

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
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/insider-analysis/${address}`,
      {
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
      },
    );

    // console.log(
    //   `${process.env.BACKEND_API_URL}/${chain}/insider-analysis/${address}`,
    // );

    // console.log('insiders', response.data);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    console.log('insiders error', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status });
  }
};
