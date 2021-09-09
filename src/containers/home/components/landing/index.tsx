import React, { useState } from 'react';
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
  const slideHeight = Math.round(2.03 * document.documentElement.clientHeight);
  const [ isJumping, setJumping ] = useState(false);

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
          isJumping={isJumping}
          setJumping={setJumping}
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            visibility: isJumping ? 'visible' : 'hidden'
          }}
        />
      </Box>
      <Comix
        sx={{
          visibility: isJumping ? 'hidden' : 'visible'
        }}
      />
    </Box>
  );
};

export default Landing;
