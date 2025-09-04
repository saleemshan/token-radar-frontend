import { NextResponse } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';

export interface ExecuteRequest {
  originChainId: string;
  destinationChainId: string;
  originCurrency: string;
  destinationCurrency: string;
  tradeType: 'EXACT_INPUT';
  amount: string;
  privyUserId?: string;
}

export const maxDuration = 60;

export const POST = async (request: Request) => {
  try {
    const body: ExecuteRequest = await request.json();

    const user = await getPrivyUser();

    // Validate required fields
    if (!body.originChainId) throw new Error('originChainId is required');
    if (!body.destinationChainId)
      throw new Error('destinationChainId is required');
    if (!body.originCurrency) throw new Error('originCurrency is required');
    if (!body.destinationCurrency)
      throw new Error('destinationCurrency is required');
    if (!body.tradeType) throw new Error('tradeType is required');
    if (!body.amount) throw new Error('amount is required');

    const response = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/health/cross-chain-swap/execute`,
      {
        ...body,
        privyUserId: body.privyUserId || user?.userId,
      },
      {
        headers: {
          'X-API-Key': process.env.IGNAS_BACKEND_API_KEY!,
          'Content-Type': 'application/json',
        },
      },
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error executing bridge:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { error: (error as any).response?.data?.error || 'Unknown error' },
      { status },
    );
  }
};
