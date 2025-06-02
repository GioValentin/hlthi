import {
  Avatar,
  Box,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { FC, MouseEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFullestAvailableName, PROJECT_NAME, RoleType } from 'utils';
import { ProviderNotifications } from '../../features';
import useEvolveUser from '../../hooks/useEvolveUser';
import { dataTestIds } from '../../constants/data-test-ids';
import { Practitioner } from 'fhir/r4b';
import { useApiClients } from '../../hooks/useAppClients';

export const UserMenu: FC = () => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const user = useEvolveUser();
  const userIsProvider = user?.hasRole([RoleType.Provider]);
  const { oystehrZambda } = useApiClients();
  const name = user?.profileResource && (getFullestAvailableName(user.profileResource, true) ?? 'HTLHi Team');
  const suffix = user?.profileResource?.name?.[0]?.suffix?.[0];

  const goToStripe = async function (practitioner: Practitioner | undefined) {

    const account = await oystehrZambda?.zambda.execute({
      id: 'physician-accounting',
      practitioner: practitioner
    });

    console.log(account);

    if(account?.output?.url == undefined) {
      throw new Error('Could not find URL');
    }

    window.open(account?.output?.url, '_blank');

  }

  return (
    <>
      {userIsProvider && <ProviderNotifications />}
      <ListItem disablePadding sx={{ width: 'fit-content' }}>
        <ListItemButton onClick={(event: MouseEvent<HTMLElement>) => setAnchorElement(event.currentTarget)}>
          <ListItemAvatar sx={{ minWidth: 'auto', mr: { xs: '0', sm: 2 } }}>
            <Avatar sx={{ bgcolor: 'primary.main' }} alt={name} src={user?.profileResource?.photo?.[0]?.url} />
          </ListItemAvatar>
          <ListItemText
            data-testid={dataTestIds.header.userName}
            sx={{ display: { xs: 'none', sm: 'block' } }}
            primary={name}
            secondary={suffix}
          />
        </ListItemButton>
      </ListItem>
      <Menu
        id="user-menu"
        anchorEl={anchorElement}
        open={anchorElement !== null}
        onClose={() => setAnchorElement(null)}
      >
        <MenuItem>
          <Box>
            <Typography variant="body1">{PROJECT_NAME} Admin</Typography>
            <Typography variant="caption">{user?.email}</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Link to="#wallet" onClick={() => {
          goToStripe(user?.profileResource);
        }} style={{ textDecoration: 'none' }}>
          <MenuItem>
            <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
              Wallet
            </Typography>
          </MenuItem>
        </Link>

        <Link to="/logout" style={{ textDecoration: 'none' }}>
          <MenuItem>
            <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
              Log out
            </Typography>
          </MenuItem>
        </Link>
        
      </Menu>
    </>
  );
};
