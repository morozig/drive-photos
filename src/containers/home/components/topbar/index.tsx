import React, {
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import HelpIcon from '@material-ui/icons/HelpOutline';
import PolicyIcon from '@material-ui/icons/Policy';
import TermsIcon from '@material-ui/icons/Gavel';
import GoogleIcon from './GoogleIcon';
import CookiesErrorIcon from '@material-ui/icons/VisibilityOff';
import { useIsSignedIn } from '../../../../lib/hooks';

const Topbar: React.FC = () => {
  const [ isMenuOpen, setMenuOpen ] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [ isHelpMenuOpen, setHelpMenuOpen ] = useState(false);
  const helpMenuRef = useRef<HTMLButtonElement>(null);

  const {
    toggleSignedIn,
    isCookiesError
  } = useIsSignedIn();

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);
  const handleMenuClick = useCallback(() => {
    setMenuOpen(current => !current);
  }, []);
  const handleHelpMenuClose = useCallback(() => {
    setHelpMenuOpen(false);
  }, []);
  const handleHelpMenuClick = useCallback(() => {
    setHelpMenuOpen(current => !current);
  }, []);

  return (
    <Toolbar>
      <IconButton
        size='large'
        edge='start'
        color='inherit'
        aria-label='menu'
        sx={{ mr: 2 }}
        ref={menuRef}
        onClick={handleMenuClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={menuRef.current}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={toggleSignedIn}
        >
          <ListItemIcon>
            <GoogleIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Sign in with Google'}
          </ListItemText>
        </MenuItem>
      </Menu>
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <Typography
          variant='h6'
          noWrap
          sx={{
            textOverflow: 'ellipsis'
          }}
        >
          {'Drive Photos'}
        </Typography>
      </Box>
      <Tooltip
        title='Terms And Conditions'
      >
        <IconButton
          size='large'
          color='inherit'
          aria-label='terms-and-policy'
          edge={'end'}
          ref={helpMenuRef}
          onClick={handleHelpMenuClick}
          sx={{
            p: { xs: '6px', md: '12px'}
          }}
        >
          <HelpIcon/>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={helpMenuRef.current}
        open={isHelpMenuOpen}
        onClose={handleHelpMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          component='a'
          href={`${process.env.PUBLIC_URL}/privacy.html`}
        >
          <ListItemIcon>
            <PolicyIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Privacy Policy'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          component='a'
          href={`${process.env.PUBLIC_URL}/terms.html`}
        >
          <ListItemIcon>
            <TermsIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Terms And Conditions'}
          </ListItemText>
        </MenuItem>
      </Menu>
      {isCookiesError &&
        <Tooltip
          title={`You need to enable 3rd party cookies.
            Click "eye" icon at the end of address bar`}
        >
          <CookiesErrorIcon
            color='error'
            sx={{
              ml: '12px',
              mr: '-6px'
            }}
          />
        </Tooltip>
      }
    </Toolbar>
  );
};

export default Topbar;
