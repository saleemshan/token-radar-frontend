import { getPrivyUser } from '@/utils/privyAuth';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { cookies } from 'next/headers';

export const maxDuration = 60;

export const POST = async (
  request: NextRequest,
  context: { params: { chain: string } },
) => {
  const chain = context.params.chain;
  const user = await getPrivyUser();
  const cookieList = cookies();
  const accessToken = cookieList.get('privy-token')?.value;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  Sentry.setUser({ id: user.userId });

  const body = await request.json();
  //getTokenAddress amount and compare it with body.amount
  try {
    const tokenBalanceResponse = await axios.get(
      `${process.env.IGNAS_BACKEND_API_URL}/health/get-token-balance?privyUserId=${user.userId}&chain=${chain}&tokenAddress=${body.fromAsset}`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
      },
    );

    const tokenBalance = tokenBalanceResponse.data.balance;

    if (tokenBalance === undefined)
      return NextResponse.json(
        { error: 'Fail to fetch token balance' },
        { status: 400 },
      );

    console.log('Checking balance');

    if (tokenBalance < body.amount)
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 },
      );

    console.log('Transfering fund');

    console.log({ body });

    const executeTradeResponse = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/health/send-transfer`,
      {
        privyUserId: user.userId,
        accessToken: accessToken,
        ...body,
      },
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
      },
    );

    console.log(executeTradeResponse.data);

    Sentry.setTag('withdraw_status', 'success');
    Sentry.captureMessage('Successful withdrawal');

    return NextResponse.json(executeTradeResponse.data, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log((error as any).response.data);

    Sentry.setTag('withdraw_status', 'failed');
    Sentry.setExtra('error', error);
    Sentry.setExtra('errorResponse', error?.response);
    Sentry.setExtra('errorResponseData', error?.response?.data);
    Sentry.captureException(error);
    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { error: (error as any).response.data.error },
      { status },
    );
  }
};
