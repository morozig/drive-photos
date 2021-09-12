import React, { Fragment } from 'react';
import {
  Box,
  Link,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
} from '@material-ui/core';
import SpeechBubble from '../speech-bubble';
import {
  SystemStyleObject
} from '@material-ui/system';
import { useIsSignedIn } from '../../../../../lib/hooks';
import GoogleIcon from '../../topbar/GoogleIcon';

interface ComixProps {
  sx?: SystemStyleObject;
}

export const jumpHeight = 2500;

const GoogleSignIn: React.FC = () => {
  const {
    toggleSignedIn
  } = useIsSignedIn();
  return (
    <ListItemButton
      onClick={toggleSignedIn}
      sx={{
        boxShadow: `
          0px 2px 1px -1px rgb(0 0 0 / 20%),
          0px 1px 1px 0px rgb(0 0 0 / 14%),
          0px 1px 3px 0px rgb(0 0 0 / 12%)
        `
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: '36px'
        }}
      >
        <GoogleIcon/>
      </ListItemIcon>
      <ListItemText>
        {'Sign in with Google'}
      </ListItemText>
    </ListItemButton>
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%',
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%'
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%'
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%'
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%'
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%'
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
          left: 0,
          maxHeight: '100vh',
          maxWidth: '90%',
        }}
      />
      <SpeechBubble
        sx={{
          position: 'absolute',
          top: 0,
          right: '20%'
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
        <GoogleSignIn/>
      </Box>
      <Toolbar
        sx={{
          backgroundColor: '#424242',
          color: 'white',
        }}
      >
        <Link
          href={`${process.env.PUBLIC_URL}/privacy.html`}
          color='inherit'
          underline='none'
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
