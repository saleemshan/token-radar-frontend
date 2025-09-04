// maintenanceMiddleware.ts
import { PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function maintenanceMiddleware(request: NextRequest) {
  const isMaintenanceMode =
    process.env.NEXT_PUBLIC_ENABLE_MAINTENANCE === 'true';
  const allowedEmails =
    process.env.NEXT_PUBLIC_MAINTENANCE_WHITELIST_EMAILS?.split(',') || [];

  if (isMaintenanceMode && request.method === 'POST') {
    const cookieList = cookies();
    const privyIdToken = cookieList.get('privy-id-token');
    if (!privyIdToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tokenValue = privyIdToken.value;

    // If not cached or token has changed, fetch the user data
    return privyClient
      .getUser({ idToken: tokenValue })
      .then((user) => {
        const email = user.email?.address ?? '';

        // Check if the user's email is in the allowed list
        if (!allowedEmails.includes(email) && !email.includes('@crush.xyz')) {
          return NextResponse.json(
            { message: 'Access denied during maintenance.' },
            { status: 403 },
          );
        }

        return NextResponse.next();
      })
      .catch((error) => {
        console.error('Token verification failed:');
        console.error({ error });
        return NextResponse.json(
          { message: 'Invalid token.' },
          { status: 403 },
        );
      });
  }

  return NextResponse.next();
}
