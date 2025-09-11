import { useAuth0 } from '@auth0/auth0-react';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

export const ProtectedRoute: FC<{
  loadingFallback: JSX.Element;
  errorFallback: JSX.Element;
}> = ({ loadingFallback, errorFallback }) => {
  const { isAuthenticated, isLoading, error, loginWithRedirect } = useAuth0();

  if (error) {
    return errorFallback;
  }

  if (isLoading) {
    return loadingFallback;
  }

  if (!isAuthenticated && !isLoading) {
    const path = window.location.pathname;
    const params = window.location.search;
    const redirectPath = `${path}${params}`;

    let phone = localStorage.getItem('HLTHiPhone');

    
    void loginWithRedirect({
      authorizationParams: {
        login_hint: phone ? phone : undefined
      },
      appState: {
        target: redirectPath,
      },
    }).catch((error) => {
      throw new Error(`Error calling loginWithRedirect Auth0: ${error}`);
    });

    return loadingFallback;
  }
  // console.log('user is authenticated, rendering Outlet');
  localStorage.removeItem('redirectDestination');
  return <Outlet />;
};
