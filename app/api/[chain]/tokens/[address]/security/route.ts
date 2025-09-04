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
      `${process.env.IGNAS_BACKEND_API_URL}/health/safety-metrics?chain=${chain}&tokenAddress=${address}`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
      },
    );

    // console.log(response.data);

    // console.log(
    //   `${process.env.IGNAS_BACKEND_API_URL}/health/safety-metrics?chain=${chain}&tokenAddress=${address}`,
    // );

    // console.log(response.data);

    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: 'Error fetching data' }, { status });
  }
};
