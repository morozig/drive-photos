import React, {
} from 'react';
import {
  AppBar,
  Box,
  Toolbar,
} from '@material-ui/core';
import Topbar from './components/topbar';
import Landing from './components/landing';

const Home: React.FC = () => {
  return (
    <Box>
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Topbar/>
      </AppBar>
      <Box component='main'>
        <Toolbar />
        <Landing />
      </Box>
    </Box>
  );
}

export default Home;
