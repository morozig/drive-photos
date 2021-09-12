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
        background: `url(${speechBubble})`,
        backgroundPosition: 'center',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        width: '30%',
        textAlign: 'center',
        padding: '8% 1% 20% 1%',
        boxSizing: 'content-box',
        lineHeight: 1,
        fontFamily: 'Comic Sans MS'
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
