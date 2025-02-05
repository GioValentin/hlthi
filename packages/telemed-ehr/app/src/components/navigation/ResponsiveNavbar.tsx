import { AccountCircle, KeyboardArrowDown } from '@mui/icons-material';
import { TabList } from '@mui/lab';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconTypeMap,
  // IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tab,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import { MouseEvent, ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-4x.png';
import useOttehrUser from '../../hooks/useOttehrUser';
import { AppTab, useNavStore } from '../../state/nav.store';
import { isLocalOrDevOrTestingOrTrainingEnv } from '../../telemed/utils/env.helper';
import { RoleType } from '../../types/types';
import { otherColors } from '../../CustomThemeProvider';

import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { SvgIconProps } from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
const drawerWidth = 240;

const { VITE_APP_ORGANIZATION_NAME_SHORT: ORGANIZATION_NAME_SHORT } = import.meta.env;
if (ORGANIZATION_NAME_SHORT == null) {
  throw new Error('Could not load env variable');
}

type NavbarItems = {
  [key in AppTab]?: { urls: string[], icon?: SvgIconProps};
};

const administratorNavbarItems: NavbarItems = {
  'In Person': { urls: ['/visits', '/visit'] },
  Schedules: { urls: ['/schedules', '/schedule'] },
  Patients: { urls: ['/patients', '/patient'] },
  Employees: { urls: ['/employees', '/employee'] },
};

const managerNavbarItems: NavbarItems = {
  'In Person': { urls: ['/visits', '/visit'] },
  Schedules: { urls: ['/schedules', '/schedule'] },
  Patients: { urls: ['/patients', '/patient'] },
  Employees: { urls: ['/employees', '/employee'] },
};

const staffNavbarItems: NavbarItems = {
  'In Person': { urls: ['/visits', '/visit'] },
  Patients: { urls: ['/patients', '/patient'] },
};

const providerNavbarItems: NavbarItems = {
  'In Person': { urls: ['/visits', '/visit'] },
  Patients: { urls: ['/patients', '/patient'] },
};

administratorNavbarItems['Admin'] = { urls: ['/telemed-admin'], icon: <AdminPanelSettingsIcon/> };
administratorNavbarItems['Telemedicine'] = { urls: ['/telemed/appointments', '/telemed', '/video-call'] };
managerNavbarItems['Admin'] = { urls: ['/telemed-admin'] };
providerNavbarItems['Telemedicine'] = { urls: ['/telemed/appointments', '/telemed', '/video-call'] };
providerNavbarItems['Employees'] = { urls: ['/employees', '/employee'] };

export default function ResponsiveNavbar(): ReactElement {
  const theme = useTheme();
  const location = useLocation();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const currentTab = useNavStore((state) => state.currentTab);
  const user = useOttehrUser();

  const navbarItems: NavbarItems = useMemo(() => {
    let navItems = {};

    if (user) {
      if (user.hasRole([RoleType.Administrator])) {
        navItems = { ...navItems, ...administratorNavbarItems };
      }
      if (user.hasRole([RoleType.Manager])) {
        navItems = { ...navItems, ...managerNavbarItems };
      }
      if (user.hasRole([RoleType.Staff])) {
        navItems = { ...navItems, ...staffNavbarItems };
      }
      if (user.hasRole([RoleType.Provider])) {
        navItems = { ...navItems, ...providerNavbarItems };
      }
    }
    return navItems;
  }, [user]);

  // on page load set the tab to the opened page
  const currentUrl = '/' + location.pathname.substring(1).split('/')[0];

  useEffect(() => {
    if (!currentTab) {
      useNavStore.setState({ currentTab: 'In Person' });
    }

    (Object.keys(navbarItems) as AppTab[]).forEach((navbarItem) => {
      if (navbarItems[navbarItem]!.urls.includes(currentUrl)) {
        useNavStore.setState({ currentTab: navbarItem });
      }
    });
  }, [currentTab, currentUrl, location.pathname, navbarItems]);

  if (location.pathname.match(/^\/telemed\/appointments\//) || location.pathname.match(/^\/visit\//)) {
    return <></>;
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      
      <List>
        
        { currentTab && 
          (Object.keys(navbarItems) as AppTab[]).map((navbarItem, index) => (
          <ListItem key={navbarItem} disablePadding id={`navbar-tab-${index}`} aria-controls={`hello-${index}`}>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecordIcon/>
              </ListItemIcon>
              <Tab
                  key={navbarItem}
                  label={navbarItem}
                  value={navbarItem}
                  id={`navbar-tab-${index}`}
                  aria-controls={`hello-${index}`} // `tabpanel-${index}`
                  component={Link}
                  to={navbarItems[navbarItem]!.urls?.[0]}
                  sx={{
                    textDecoration: currentTab === navbarItem ? 'underline' : 'none'
                  }}
                />
              {/* <ListItemText primary={navbarItem} /> */}
            </ListItem>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon/>
              </ListItemIcon>
               <Link to="/logout">
                <Typography variant="body1" color="secondary" sx={{ fontWeight: 'bold' }}>
                  Log out
                </Typography>
               </Link>
              
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary={user?.name || <Skeleton width={100} aria-busy="true" />} />
            </ListItemButton>
          </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          backgroundColor:  '#ffff'
        }}
      >
        <Toolbar 
        sx={{
          backgroundColor: '#ffff',
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            
            sx={{ mr: 2, display: { sm: 'none' }, color:'#616161' }}
          >
            <MenuIcon />
          </IconButton>
          <Link to="/">
            <img
              src={logo}
              alt={`${ORGANIZATION_NAME_SHORT} logo`}
              style={{
                marginRight: 20,
                marginTop: 10,
                width: 158,
                height: 40,
              }}
            />
          </Link>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
      </Box>
    </Box>
  );

//   return (
//     <AppBar
//       position="sticky"
//       color="transparent"
//       sx={{
//         boxShadow: 'none',
//         backgroundColor: otherColors.headerBackground,
//       }}
//     >
//       <Container maxWidth="xl">
//         <Toolbar disableGutters variant="dense">
//           <Link to="/">
//             <img
//               src={logo}
//               alt={`${ORGANIZATION_NAME_SHORT} logo`}
//               style={{
//                 marginRight: 20,
//                 marginTop: 10,
//                 width: 158,
//                 height: 40,
//               }}
//             />
//           </Link>
//           <TabList
//             onChange={(_: SyntheticEvent, value: string) => {
//               useNavStore.setState({ currentTab: value });
//             }}
//             sx={{
//               mt: 2.5,
//               minHeight: 60,
//               flexGrow: 1,
//             }}
//             textColor="secondary"
//             indicatorColor="secondary"
//           >
//             {currentTab &&
//               (Object.keys(navbarItems) as AppTab[]).map((navbarItem, index) => (
//                 <Tab
//                   key={navbarItem}
//                   label={navbarItem}
//                   value={navbarItem}
//                   id={`navbar-tab-${index}`}
//                   aria-controls={`hello-${index}`} // `tabpanel-${index}`
//                   component={Link}
//                   to={navbarItems[navbarItem]!.urls?.[0]}
//                   sx={{
//                     fontSize: 16,
//                     fontWeight: 700,
//                     textTransform: 'capitalize',
//                     color: '#39413e',
//                   }}
//                 />
//               ))}
//           </TabList>
//           {/* <IconButton color="primary" sx={{ mr: 2 }}>
//             <Settings />
//           </IconButton> */}
//           <Typography variant="body1" sx={{ mr: 2, color: '#39413e' }}>
//             {user?.name || <Skeleton width={100} aria-busy="true" />}
//           </Typography>
//           <Button
//             color="secondary"
//             aria-label="open user account menu"
//             aria-controls="user-menu"
//             aria-haspopup="true"
//             onClick={(event: MouseEvent<HTMLElement>) => setAnchorElement(event.currentTarget)}
//             endIcon={<KeyboardArrowDown />}
//           >
//             <AccountCircle />
//           </Button>
//           <Menu
//             id="user-menu"
//             anchorEl={anchorElement}
//             open={anchorElement !== null}
//             onClose={() => setAnchorElement(null)}
//           >
//             <MenuItem>
//               <Box>
//                 <Typography variant="body1">{ORGANIZATION_NAME_SHORT} Admin</Typography>
//                 <Typography variant="caption">{user?.email}</Typography>
//               </Box>
//             </MenuItem>
//             <Divider />
//             <Link to="/logout" style={{ textDecoration: 'none' }}>
//               <MenuItem>
//                 <Typography variant="body1" color="secondary" sx={{ fontWeight: 'bold' }}>
//                   Log out
//                 </Typography>
//               </MenuItem>
//             </Link>
//           </Menu>
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );


}
