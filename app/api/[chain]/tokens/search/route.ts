import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export const GET = async (
  request: NextRequest,
  // context: { params: { chain: string } },
) => {
  // const chain = context.params.chain;
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `${process.env.BACKEND_API_URL}/all/tokens`,
      // `${process.env.BACKEND_API_URL}/${chain}/tokens`,
      {
        params: { query },
        headers: {
          'x-api-key': `${process.env.BACKEND_API_KEY}`,
        },
      },
    );

    // console.log(response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    return NextResponse.json({ error: error }, { status });
  }
};
