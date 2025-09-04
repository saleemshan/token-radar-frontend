import { NextResponse } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';

export const GET = async () => {
  const user = await getPrivyUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const response = await axios.get(
      `${process.env.REFERRAL_BACKEND_API_URL}/transaction/${user.userId}/rate`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'x-api-key': process.env.REFERRAL_BACKEND_API_KEY!,
        },
      },
    );
    // console.log('referral commission', response.data);
    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
