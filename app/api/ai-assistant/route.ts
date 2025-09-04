import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { getPrivyUser } from '@/utils/privyAuth';

export const maxDuration = 120;

export const POST = async (request: NextRequest) => {
  const user = await getPrivyUser();
  console.log({ user });

  const encoder = new TextEncoder();
  if (!user) {
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const errorStream = new ReadableStream({
      start(controller) {
        const errorMessage = `It appears that you do not have the necessary authorization. Kindly log in again and attempt once more.`;
        const chunk = encoder.encode(errorMessage);
        controller.enqueue(chunk);
        controller.close();
      },
    });

    return new NextResponse(errorStream, { status: 401 });
  }

  const { query, context } = await request.json();

  if (!query) {
    const errorStream = new ReadableStream({
      start(controller) {
        const errorMessage = `Ask me anything.`;
        const chunk = encoder.encode(errorMessage);
        controller.enqueue(chunk);
        controller.close();
      },
    });

    return new NextResponse(errorStream, { status: 400 });
    // return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await axios.post(
      `${process.env.IGNAS_BACKEND_API_URL}/health/stream-response`,
      {
        query: query,
        privyUserId: user.userId,
        username: user.userId,
        context: JSON.stringify(context),
      },
      {
        headers: {
          'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = response.data;

    const stream = new ReadableStream({
      async start(controller) {
        const words = data.split(' ');
        for (const word of words) {
          const chunk = encoder.encode(word + ' ');
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    return new NextResponse(stream);

    // return NextResponse.json({ message: response.data }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status || 500;
    // console.log('AI Assistant Error: ', error);

    const errorStream = new ReadableStream({
      start(controller) {
        const errorMessage = 'Something went wrong, try again later.';
        const chunk = encoder.encode(errorMessage);
        controller.enqueue(chunk);
        controller.close();
      },
    });

    return new NextResponse(errorStream, { status });
  }
};
