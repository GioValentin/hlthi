import { useAuth0 } from '@auth0/auth0-react';
import { useApiClients } from '@hooks/useAppClients';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ErxPortal() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { oystehr } = useApiClients();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const initErx = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/');
          return;
        }

        if(!oystehr) {
          return;
        }

        const user = await oystehr?.user.me();
        const token = await getAccessTokenSilently();
        const practitionerId = user?.profile.split('/')[1]; // adjust if needed

        // Step 1: Check enrollment
        const checkUrl = `https://erx-api.zapehr.com/v3/practitioner/${practitionerId}`;
        const checkRes = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
            'x-oystehr-project-id': import.meta.env.VITE_APP_PROJECT_ID,
          },
        });

        const checkJson = await checkRes.json();
        console.log('Enrollment status:', checkJson);

        // Step 2: Create SSO link
        const ssoUrl = 'https://erx-api.zapehr.com/v3/practitioner/connect';
        const ssoRes = await fetch(ssoUrl, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
            'x-oystehr-project-id': import.meta.env.VITE_APP_PROJECT_ID,
          },
        });

        const ssoJson = await ssoRes.json();
        console.log('SSO Link:', ssoJson);

        if (ssoJson?.ssoLink) {
          window.location.href = ssoJson.ssoLink;
        } else {
          throw new Error('SSO link not returned');
        }
      } catch (err) {
        console.error('Error initializing eRx portal:', err);
        navigate('/error'); // Or show a message, etc.
      } finally {
        setLoading(false);
      }
    };

    initErx();
  }, [isAuthenticated, getAccessTokenSilently, navigate,oystehr]);

  return loading ? <p>Loading eRx Portal...</p> : null;
}
