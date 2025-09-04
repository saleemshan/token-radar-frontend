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

  //estimate transaction
  const tradable = await estimateTransaction(user.userId, body);

  if (!tradable) {
    return NextResponse.json(
      {
        error: {
          error: `Please set proper slippage.`,
          slippage: body.slippageLimit,
          googleEvent: 'trade_error_user',
        },
      },
      { status: 400 },
    );
  }

  try {
    //if body.action = buy, get sol bal
    const tokenAddress =
      body.action === 'buy' ? body.chainAddress : body.tokenAddress;
    const tokenBalanceResponse = await axios.get(
      `${process.env.IGNAS_BACKEND_API_URL}/health/get-token-balance?privyUserId=${user.userId}&chain=${chain}&tokenAddress=${tokenAddress}`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
      },
    );

    const tokenBalance = tokenBalanceResponse.data.balance;

    if (tokenBalance === undefined)
      return NextResponse.json(
        {
          error: {
            error: 'Fail to fetch token balance',
            googleEvent: 'trade_error_user',
          },
        },
        { status: 400 },
      );

    console.log('Checking balance');

    if (tokenBalance < body.amount)
      return NextResponse.json(
        {
          error: {
            error: 'Insufficient balance',
            googleEvent: 'trade_error_user',
          },
        },
        { status: 400 },
      );

    console.log('Executing trade');

    //if slippage = 0 or priority fee = 0, set it to auto
    const slippageLimit =
      body.slippageLimit === 0 ? 'auto' : body.slippageLimit;
    const priorityFee = body.priorityFee === 0 ? 'auto' : body.priorityFee;

    const executeTradeResponse = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/health/execute-transaction`,
      {
        privyUserId: user.userId,
        accessToken: accessToken,
        ...body,
        slippageLimit,
        priorityFee,
      },
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
      },
    );

    console.log({ executeTradeResponse });

    Sentry.setTag('trade_status', 'success');
    Sentry.captureMessage('Successful trade');

    return NextResponse.json(executeTradeResponse.data, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error.response);
    Sentry.setTag('trade_status', 'failed');
    Sentry.setExtra('error', error);
    Sentry.setExtra('errorResponse', error?.response);
    Sentry.setExtra('errorResponseData', error?.response?.data);
    Sentry.setExtra('errorResponse', error?.response);
    Sentry.setExtra('errorResponseData', error?.response?.data);
    Sentry.captureException(error);
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json(
      { error: error.response.data, googleEvent: 'trade_error_s_confirmation' },
      { status },
    );
  }
};

const estimateTransaction = async (userId: string, body: ExecuteTrade) => {
  try {
    const response = await axios.get(
      `${process.env.IGNAS_BACKEND_API_URL}/health/estimate-transaction`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
        params: {
          privyUserId: userId,
          chain: body.chain,
          tokenAddress: body.tokenAddress,
          amount: body.amount,
          slippageLimit: body.slippageLimit === 0 ? 'auto' : body.slippageLimit,
          priorityFee: body.priorityFee === 0 ? 'auto' : body.priorityFee,
          action: body.action,
          amountType: 'input',
        },
      },
    );

    return response.data.tradable;
  } catch (error) {
    // const status = (error as any).response?.status || 500;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log((error as any).response.data);
    return false;
  }
};

// const isPriceWithinSlippageRange = async (
//   chain: string,
//   tokenAddress: string,
//   oldPrice: number,
//   slippage: number,
// ) => {
//   try {
//     const res = await axios.get(
//       `${process.env.IGNAS_BACKEND_API_URL}/health/get-token-price`,
//       {
//         headers: {
//           'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
//         },
//         params: {
//           tokenAddress: tokenAddress,
//           tokenId: tokenAddress,
//           chain: chain,
//           privyUserId: 'privyUserId',
//         },
//       },
//     );

//     const newPrice = res.data.priceUSD;
//     const lowerBound = newPrice * (1 - slippage);
//     const upperBound = newPrice * (1 + slippage);
//     // Check if the old price falls within this range
//     return {
//       valid: oldPrice >= lowerBound && oldPrice <= upperBound,
//       oldPrice,
//       newPrice,
//     };
//   } catch (error) {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     console.log((error as any).response.data);
//     return {
//       valid: false,
//       oldPrice: 0,
//       newPrice: 0,
//     };
//   }
// };
