import React, { useMemo, useState } from 'react';
import {
  Box, Toolbar
} from '@material-ui/core';
import Comix, {
  slides
} from './comix';
import Space from './space';
import { useScrollAware } from './hooks';
import { useIsTouchScreen } from '../../../../lib/hooks';

const Landing: React.FC = () => {
  const scrollTop = useScrollAware();
  const isTouchScreen = useIsTouchScreen();
  const slideHeight = Math.round(2.03 * document.documentElement.clientHeight);
  const [ isJumping, setJumping ] = useState(false);
  const jumpHeight = useMemo(
    () => isTouchScreen ? 20 : 2500,
    [isTouchScreen]
  );

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
          flexDirection: 'column',
          zIndex: isJumping ? undefined : -1
        }}
      >
        <Toolbar/>
        {!isTouchScreen ?
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
          /> : null
        }
      </Box>
      <Comix
        jumpHeight={jumpHeight}
        sx={{
          visibility: isJumping ? 'hidden' : 'visible'
        }}
      />
    </Box>
  );
};

export default Landing;
