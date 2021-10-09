import React, { useEffect, useState } from 'react';
import {
  SystemStyleObject,
} from '@material-ui/system';
import {
  keyframes
} from '@emotion/react';
import {
  Box
} from '@material-ui/core';
import { FitMode } from '../..';
import { RectSize } from '../thumbnails/hooks';

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
  containerRectSize?: RectSize,
  fitMode?: FitMode;
  sx?: SystemStyleObject;
};

const ImageSkeleton: React.FC<ImageSkeletonProps> = (props) => {
  const {
    width,
    height,
    containerRectSize,
    fitMode,
    sx
  } = props;

  const [ isBoundByWidth, setBoundByWidth ] = useState(false);

  useEffect(() => {
    if (fitMode === FitMode.Best && containerRectSize &&
      containerRectSize.width && containerRectSize.height
    ) {
      const heightScale = containerRectSize.height < height ?
        containerRectSize.height / height : 1;
      const widthScale = containerRectSize.width < width ?
        containerRectSize.width / width : 1;
      const isBoundByWidth = (widthScale < heightScale);
      setBoundByWidth(isBoundByWidth);
    }
  }, [
    width,
    height,
    containerRectSize,
    fitMode
  ]);

  return (
    <Box
      component='svg'
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${width} ${height}`}
      sx={{
        bgcolor: 'grey.900',
        animation: `${pulseKeyframe} 1.5s ease-in-out 0.5s infinite`,
        ...(fitMode === FitMode.Best && 
          isBoundByWidth ? {
            width: `${width}px`,
            maxWidth: '100%'
          } : {
            height: `${height}px`,
            maxHeight: '100%'
          }
        ),
        ...(fitMode === FitMode.Width && {
          width: `${width}px`,
          maxWidth: '100%'
        }),
        ...(fitMode === FitMode.Height && {
          height: `${height}px`,
          maxHeight: '100%'
        }),
        ...(fitMode === FitMode.Original && {
          width: `${width}px`,
          height: `${height}px`,
        }),
        ...sx,
      }}
    />
  );
};

export default ImageSkeleton;
