import {useAuth0} from '@auth0/auth0-react';
import {
  AppBar, Avatar,
  Box,
  Button,
  IconButton, Menu, MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import {useState} from 'react';

export const NavBar = () => {
  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logoutWithRedirect = () =>
    logout(
      {
        logoutParams: {
          returnTo: window.location.origin,
        },
      });

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>
            Webhook + SocketIO
          </Typography>
          {
            !isAuthenticated
            && (
              <Button
                color="inherit"
                onClick={() => loginWithRedirect()}
              >Login</Button>
            )
          }
          {
            isAuthenticated
            && (
              <Box>
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{p: 0}}
                >
                  <Avatar
                    alt="User-Image"
                    src={user.picture}
                  />
                </IconButton>
                <Menu
                  sx={{mt: '45px'}}
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem key={'user-name'}>
                    <Typography sx={{textAlign: 'center'}}>{user.name}</Typography>
                  </MenuItem>
                  <MenuItem
                    key={'logout'}
                    onClick={() => logoutWithRedirect()}
                  >
                    <Typography sx={{textAlign: 'center'}}>Log out</Typography>
                  </MenuItem>
                </Menu>
              </Box>

            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
};
