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
import AboutIcon from '@material-ui/icons/Info';
import PolicyIcon from '@material-ui/icons/Policy';
import TermsIcon from '@material-ui/icons/Gavel';
import { Link } from 'react-router-dom';
import OpenViewIcon from '@material-ui/icons/OpenInBrowser';

const Topbar: React.FC = () => {
  const [ isMenuOpen, setMenuOpen ] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [ isHelpMenuOpen, setHelpMenuOpen ] = useState(false);
  const helpMenuRef = useRef<HTMLButtonElement>(null);

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
        disableScrollLock={true}
      >
        <MenuItem
          component={Link}
          to={'/view'}
        >
          <ListItemIcon>
            <OpenViewIcon/>
          </ListItemIcon>
          <ListItemText>
            {'Open View'}
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
        disableScrollLock={true}
      >
        <MenuItem
          component='a'
          href={`${process.env.PUBLIC_URL}/about.html`}
        >
          <ListItemIcon>
            <AboutIcon/>
          </ListItemIcon>
          <ListItemText>
            {'About'}
          </ListItemText>
        </MenuItem>
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
    </Toolbar>
  );
};

export default Topbar;
