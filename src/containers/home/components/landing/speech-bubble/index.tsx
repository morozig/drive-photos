import React, {
} from 'react';
import {
  Typography,
  Box
} from '@material-ui/core';
import './ComicFont.css';
import {
  SystemStyleObject
} from '@material-ui/system';
import speechBubble from './speech-bubble.svg';
import speechBubbleWide from './speech-bubble-wide.svg';

interface SpeechBubbleProps {
  sx?: SystemStyleObject;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = (props) => {
  const {
    sx
  } = props;
  return (
    <Box
      sx={{
        ...sx,
        background: {
          xs: `url(${speechBubble})`,
          md: `url(${speechBubbleWide})`,
        },
        backgroundPosition: 'center',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center',
        fontFamily: 'Comic Sans MS',
        padding: {
          xs: '10vmin 5vmin 30vmin 5vmin',
          md: '15vmin 15vmin 15vmin 15vmin',
        },
        maxWidth: {
          xs: '60vmin',
          md: '100vmin',
        },
        marginRight: {
          xs: '0',
          md: '-5vmin',
        },
      }}
    >
      {/* {props.children} */}
      <Typography
        fontFamily={'Comic Sans MS'}
        fontSize={'7vmin'}
        lineHeight={'7vmin'}
      >
        {props.children}
      </Typography>
    </Box>
  );
};

export default SpeechBubble;
