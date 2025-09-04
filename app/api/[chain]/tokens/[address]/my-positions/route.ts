import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export const GET = async (
  request: NextRequest,
  context: { params: { address: string; chain: string } },
) => {
  const address = context.params.address;
  const chain = context.params.chain;
  const searchParams = request.nextUrl.searchParams;
  const publicWalletAddress = searchParams.get('public_wallet_address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    if (!publicWalletAddress) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // console.log(
    //   `${process.env.BACKEND_API_URL}/${chain}/transactions/${publicWalletAddress}?analytics=true&filter=${address}`,
    // );

    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/${chain}/transactions/${publicWalletAddress}?analytics=true&filter=${address}`,
      {
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
      },
    );
    // console.log(response.data);
    // console.log(response.data.data.transactions);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: 'Error fetching data' }, { status });
  }
};
