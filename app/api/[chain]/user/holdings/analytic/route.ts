import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';

export const GET = async (
  request: NextRequest,
  context: { params: { chain: string; walletAddress: string } },
) => {
  const chain = context.params.chain;
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get('walletAddress');

  if (!chain || !walletAddress) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const user = await getPrivyUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // console.log(
    //   `${process.env.BACKEND_API_URL}/transactions-all-pnl?period=1d&chain=${chain}&address=${walletAddress}`,
    // );

    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/transactions-all-pnl?period=1d&chain=${chain}&address=${walletAddress}`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
        },
      },
    );

    // console.log(response.data.data);

    return NextResponse.json({ data: response.data.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
