import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';
import * as Sentry from '@sentry/nextjs';

export const GET = async (
  request: NextRequest,
  context: { params: { chain: string } },
) => {
  const chain = context.params.chain;
  const user = await getPrivyUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await axios.get(
      `${process.env.IGNAS_BACKEND_API_URL}/health/get-favourites`,
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
        },
        params: {
          privyUserId: user.userId,
          chain: chain,
        },
      },
    );

    // console.log(response);
    // console.log({ user });

    return NextResponse.json({ data: response.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};

export const POST = async (
  request: NextRequest,
  context: { params: { chain: string } },
) => {
  const user = await getPrivyUser();
  const chain = context.params.chain;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  Sentry.setUser({ id: user.userId });

  const body = await request.json();

  try {
    const response = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/health/set-favourite`,
      {
        privyUserId: user.userId,
        chain: chain,
        ...body,
      },
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
          'Content-Type': 'application/json',
        },
      },
    );

    return NextResponse.json({ message: response.data }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Sentry.setTag('favourite_token_status', 'failed');
    Sentry.captureException(error);
    Sentry.setExtra('error', error);
    Sentry.setExtra('errorResponse', error?.response);
    Sentry.setExtra('errorResponseData', error?.response?.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
