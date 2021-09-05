import React from 'react';
import {
  Box, Toolbar
} from '@material-ui/core';
import Comix, {
  slides,
  jumpHeight
} from './comix';
import Space from './space';
import { useScrollAware } from './hooks';

const Landing: React.FC = () => {
  const scrollTop = useScrollAware();
  const slideHeight = 2 * document.documentElement.clientHeight;

  return (
    <Box>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar/>
        <Space
          scrollTop={scrollTop}
          slideHeight={slideHeight}
          jumpHeight={jumpHeight}
          slides={slides}
          sx={{
            flexGrow: 1,
            overflow: 'hidden'
          }}
        />
      </Box>
      <Comix
        sx={{
          visibility: 'hidden'
        }}
      />
    </Box>
  );
};

export default Landing;
