import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get coin symbol from query param
    const url = new URL(request.url);
    const coin = url.searchParams.get('coin');

    if (!coin) {
      return NextResponse.json(
        { error: 'Coin parameter is required' },
        { status: 400 },
      );
    }

    // Fetch image from Hyperliquid
    const imageUrl = `https://app.hyperliquid.xyz/coins/${coin}.svg`;
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image for ${coin}` },
        { status: response.status },
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Error proxying coin image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 },
    );
  }
}
