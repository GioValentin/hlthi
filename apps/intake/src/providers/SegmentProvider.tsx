// src/SegmentProvider.tsx
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AnalyticsProvider, useAnalytics } from '@segment/analytics-react';
import { SegmentClient } from './SegmentClient';

export default function SegmentProvider({ children }: { children: ReactNode }) {
  return (
    <AnalyticsProvider client={SegmentClient}>
      <SegmentInner>{children}</SegmentInner>
    </AnalyticsProvider>
  );
}

/* --- inner component has access to the hook --- */

function SegmentInner({ children }: { children: ReactNode }) {
  const { identify, page, reset } = useAnalytics();
  const { user, isAuthenticated } = useAuth0();
  const location = useLocation();

  /* 1️⃣  Merge anonymous → logged-in */
  useEffect(() => {
    if (isAuthenticated && user) {

        console.log(user);
    //   identify(user.sub, {
    //     email: user.email,
    //     name: user.name,
    //     locale: user.locale,
    //     // …other traits
    //   });
    } else {
      reset();                               // clear traits & anonymousId on logout
    }
  }, [isAuthenticated, user, identify, reset]);

  /* 2️⃣  Fire a page() on every SPA route change */
  useEffect(() => {
    page();                                  // sdk adds url / title automatically
  }, [location.pathname, page]);

  return <>{children}</>;
}
