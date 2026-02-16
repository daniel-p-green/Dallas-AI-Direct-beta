'use client';

import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

type OptionalClerkProviderProps = {
  enabled: boolean;
  children: ReactNode;
};

export function OptionalClerkProvider({ enabled, children }: OptionalClerkProviderProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/api/auth/attendee/verify-link?next=/room"
      afterSignUpUrl="/api/auth/attendee/verify-link?next=/room"
    >
      {children}
    </ClerkProvider>
  );
}
