import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';

export const maxDuration = 30;

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const tokens = searchParams.get('tokens');

  if (!address) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const user = await getPrivyUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.get(
      `${
        process.env.BACKEND_API_URL
      }/arbitrum/wallet-holdings?address=${address}${
        tokens ? `&tokens=${tokens}` : ''
      }`,
      {
        headers: {
          'x-api-key': process.env.BACKEND_API_KEY!,
        },
      },
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
