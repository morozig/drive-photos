import React, { Fragment } from 'react';
import {
  Box,
  Link,
  Paper,
  Toolbar,
  Button
} from '@material-ui/core';
import SpeechBubble from '../speech-bubble';
import {
  SystemStyleObject
} from '@material-ui/system';
import { Link as RouterLink } from 'react-router-dom';
import OpenViewIcon from '@material-ui/icons/OpenInBrowser';

interface ComixProps {
  jumpHeight: number;
  sx?: SystemStyleObject;
}

const OpenView: React.FC = () => {
  return (
    <Button
      component={RouterLink}
      to={'/view'}
      variant={'contained'}
      color='secondary'
      startIcon={<OpenViewIcon/>}
    >
      {'Open View'}
    </Button>
  );
};

export const slides = [
  <Paper>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#6df3db',
        border: 'solid black 0.8vmin',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl1.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0,
        }}
      >
        {'Drive Photos'}
      </SpeechBubble>
    </Box>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#ffdc2e',
        border: 'solid black 0.8vmin',
        marginTop: '3vh',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl2.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0
        }}
      >
        {'Online image viewer for Google Drive.'}
      </SpeechBubble>
    </Box>
  </Paper>,
  <Paper>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#f31872',
        border: 'solid black 0.8vmin',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl3.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0
        }}
      >
        {'Access your photos anywhere.'}
      </SpeechBubble>
    </Box>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#02c7fc',
        border: 'solid black 0.8vmin',
        marginTop: '3vh',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl4.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0
        }}
      >
        {'All devices are supported.'}
      </SpeechBubble>
    </Box>
  </Paper>,
  <Paper>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#fe0000',
        border: 'solid black 0.8vmin',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl5.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0
        }}
      >
        {'Free and open source.'}
      </SpeechBubble>
    </Box>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#fe3989',
        border: 'solid black 0.8vmin',
        marginTop: '3vh',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl6.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0
        }}
      >
        {'No server, all personal data stays in your browser.'}
      </SpeechBubble>
    </Box>
  </Paper>,
  <Paper>
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#db0285',
        border: 'solid black 0.8vmin',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        component='img'
        src={`${process.env.PUBLIC_URL}/assets/girl7.jpg`}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: {
            xs: '-5%',
            md: '0',
          },
          maxHeight: {
            xs: '60vh',
            md: '100%',
          },
          maxWidth: {
            xs: undefined,
            md: '70vw',
          },
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: {
            xs: '10%',
            md: '0',
          },
          right: 0
        }}
      >
        {'Fullscreen and slideshow modes.'}
      </SpeechBubble>
    </Box>
    <Box
      sx={{
        height: '103vh',
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'grid',
          justifyContent: 'center',
          alignContent: 'center'
        }}
      >
        <Box
          component={'img'}
          src={`${process.env.PUBLIC_URL}/assets/Logo_48.svg`}
          sx={{
            height: '48px',
            width: '48px',
            justifySelf: 'center',
            margin: '0 0 24px 0'
          }}
        />
        <OpenView/>
      </Box>
      <Toolbar
        sx={{
          backgroundColor: '#424242',
          color: 'white',
        }}
      >
        <Link
          href={`${process.env.PUBLIC_URL}/about.html`}
          color='inherit'
          underline='none'
        >
          {'About'}
        </Link>
        <Link
          href={`${process.env.PUBLIC_URL}/privacy.html`}
          color='inherit'
          underline='none'
          sx={{
            marginLeft: '24px'
          }}
        >
          {'Privacy Policy'}
        </Link>
        <Link
          href={`${process.env.PUBLIC_URL}/terms.html`}
          color='inherit'
          underline='none'
          sx={{
            marginLeft: '24px'
          }}
        >
          {'Terms And Conditions'}
        </Link>
      </Toolbar>
    </Box>
  </Paper>
];

const Comix: React.FC<ComixProps> = (props) => {
  const {
    jumpHeight,
    sx
  } = props;
  return (
    <Box
      sx={{
        ...sx,
        backgroundColor: 'black'
      }}
    >
      {slides.map((slide, i) => (
        <Fragment key={i}>
          {slide}
          {i < slides.length - 1 ?
            <Box
              sx={{
                height: `${jumpHeight}px`
              }}
            /> : null
          }
        </Fragment>
      ))}
    </Box>
  );
};

export default Comix;
