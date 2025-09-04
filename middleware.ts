// middleware.ts

import type { NextRequest } from 'next/server';
import { maintenanceMiddleware } from './middlewares/maintenanceMiddleware';
import { apiProtectionMiddleware } from './middlewares/apiProtectionMiddleware';

export function middleware(request: NextRequest) {
  const apiProtectionResponse = apiProtectionMiddleware(request);
  if (apiProtectionResponse.status === 403) {
    return apiProtectionResponse;
  }

  return maintenanceMiddleware(request);
}
