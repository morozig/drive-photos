import React, {
} from 'react';
import {
  SystemStyleObject,
} from '@material-ui/system';
import {
  keyframes
} from '@emotion/react';
import {
  Box
} from '@material-ui/core';

const pulseKeyframe = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

interface ImageSkeletonProps {
  width: number;
  height: number;
  sx?: SystemStyleObject;
};

const ImageSkeleton: React.FC<ImageSkeletonProps> = (props) => {
  const {
    width,
    height,
    sx
  } = props;

  return (
    <Box
      component='svg'
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${width} ${height}`}
      sx={{
        ...sx,
        bgcolor: 'grey.900',
        animation: `${pulseKeyframe} 1.5s ease-in-out 0.5s infinite`
      }}
    />
  );
};

export default ImageSkeleton;
