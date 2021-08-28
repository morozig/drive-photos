import React, {
} from 'react';
import {
  Box,
  Paper,
} from '@material-ui/core';
import SpeechBubble from './speech-bubble';

const Landing: React.FC = () => {
  
  return (
    <Box>
      <Paper>
        <Box
          sx={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
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
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin',
            marginTop: '3vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
            }}
          >
            {'Online image viewer for Google Drive.'}
          </SpeechBubble>
        </Box>
      </Paper>
      <Paper>
        <Box
          sx={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
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
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin',
            marginTop: '3vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
            }}
          >
            {'All devices are supported.'}
          </SpeechBubble>
        </Box>
      </Paper>
      <Paper>
        <Box
          sx={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
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
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin',
            marginTop: '3vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
            }}
          >
            {'No server, all personal data stays in your browser.'}
          </SpeechBubble>
        </Box>
      </Paper>
      <Paper>
        <Box
          sx={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
            }}
          >
            {'Image preloading for fast transition.'}
          </SpeechBubble>
        </Box>
        <Box
          sx={{
            height: '100vh',
            width: '100%',
            position: 'relative',
            backgroundColor: 'rgb(105 239 219)',
            border: 'solid black 0.8vmin',
            marginTop: '3vmin'
          }}
        >
          <Box
            component='img'
            src={`${process.env.PUBLIC_URL}/assets/girl1.png`}
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
              right: '10%'
            }}
          >
            {'Fullscreen and slideshow modes.'}
          </SpeechBubble>
        </Box>
      </Paper>
    </Box>
  );
};

export default Landing;
