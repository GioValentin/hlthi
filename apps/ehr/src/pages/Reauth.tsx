import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box,Typography } from '@mui/material';
import PageContainer from '../layout/PageContainer';

export default function Reauth(): React.ReactElement {
  const { account_id } = useParams<{ account_id: string }>(); // ✅ Type added for safety

  useEffect(() => {
    if (!account_id) {
      console.error("Missing account_id in URL params.");
      return;
    }

    const fetchAccountLink = async () => {
      try {
        const response = await fetch(
          "https://project-api.zapehr.com/v1/zambda/get-connected-auth/execute-public",
          {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "x-oystehr-project-id": "4a44d30b-6200-4256-9a36-63bde08c2cd7",
            },
            body: JSON.stringify({
              account: account_id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Stripe account link");
        }

        const data = await response.json();

        if (data?.output.url) {
          window.location.href = data.output.url;
        } else {
          console.error("No redirect URL found in response:", data);
        }
      } catch (error) {
        console.error("Error fetching Stripe account link:", error);
      }
    };

    fetchAccountLink();
  }, [account_id]); // ✅ added dependency

  return <PageContainer>
        <>
            <Box>
              <Typography>
                Please wait a couple seconds. We're redirecting you to your direct deposit account.
              </Typography>
            </Box>
        </>
        </PageContainer>;
}