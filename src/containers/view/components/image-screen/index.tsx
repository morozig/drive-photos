import React, { useEffect } from 'react';
import {
  SystemStyleObject,
} from '@material-ui/system';
import {
  Box
} from '@material-ui/core';
import { FitMode } from '../..';
import { RectSize } from '../thumbnails/hooks';
import { useScrollActions } from '../viewer/hooks';
import ImageSkeleton from '../image-skeleton';

const wheelCount = 3;
const slideShowInterval = 5000;

interface ImageScreenProps {
  file?: gapi.client.drive.File;
  containerRectSize?: RectSize,
  fitMode?: FitMode;
  zoom?: number;
  isScrollToBottom?: boolean;
  isSlideshowPlaying?: boolean;
  isScrollDisabled?: boolean;
  onPrevImage?: () => void;
  onNextImage?: () => void;
  onImageError?: () => void;
  isPreload?: boolean;
  onOverflowChanged?: (isOverflow: boolean) => void;
  sx?: SystemStyleObject;
};

const ImageScreen: React.FC<ImageScreenProps> = (props) => {
  const {
    file,
    containerRectSize,
    fitMode,
    zoom = 100,
    isScrollToBottom,
    isSlideshowPlaying,
    isScrollDisabled,
    onPrevImage,
    onNextImage,
    onImageError,
    isPreload,
    onOverflowChanged,
    sx
  } = props;

  const {
    ref,
    scrollToTop,
    scrollToBottom,
    scrollNextSlide
  } = useScrollActions({
    isDisabled: isScrollDisabled,
    wheelCount,
    onScrollOverTop: onPrevImage,
    onScrollBelowBottom: onNextImage,
    onOverflowChanged
  });

  useEffect(() => {
    if (isSlideshowPlaying) {
      const timer = setInterval(scrollNextSlide, slideShowInterval);
      return () => {
        clearInterval(timer);
      };
    }
  }, [
    isSlideshowPlaying,
    scrollNextSlide
  ]);

  useEffect(() => {
    if (file && ref.current && isScrollToBottom !== undefined) {
      if (isScrollToBottom) {
        scrollToBottom();
      } else {
        scrollToTop()
      }
    }
  }, [
    file,
    ref,
    scrollToTop,
    isScrollToBottom,
    scrollToBottom
  ]);

  return (
    <Box
      sx={{
        textAlign: 'center',
        overflow: 'auto',
        whiteSpace: 'nowrap',
        position: 'relative',
        ...sx
      }}
      ref={ref}
    >
      {!!file &&
        <>
          {!isPreload &&
            <Box
              sx={{
                textAlign: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <Box
                component='span'
                sx={{
                  height: '100%',
                  verticalAlign: 'middle',
                  display: 'inline-block'
                }}
              />
              {
                file.imageMediaMetadata &&
                file.imageMediaMetadata.width && file.imageMediaMetadata.height &&
                <ImageSkeleton
                  width={file.imageMediaMetadata.width}
                  height={file.imageMediaMetadata.height}
                  containerRectSize={containerRectSize}
                  fitMode={fitMode}
                  zoom={zoom}
                  sx={{
                    verticalAlign: 'middle'
                  }}
                />
              }
            </Box>
          }
          <Box
            component='span'
            sx={{
              height: '100%',
              verticalAlign: 'middle',
              display: 'inline-block'
            }}
          />
          <Box
            component={'img'}
            key={file.id}
            src={file.webContentLink}
            alt={file.name}
            onClick={onNextImage}
            onError={onImageError}
            sx={{
              position: 'relative',
              verticalAlign: 'middle',
              ...(fitMode === FitMode.Best && {
                maxWidth: '100%',
                maxHeight: '100%'
              }),
              ...(fitMode === FitMode.Width && {
                maxWidth: '100%'
              }),
              ...(fitMode === FitMode.Height && {
                maxHeight: '100%'
              }),
              ...(fitMode === FitMode.Manual && {
                height: file.imageMediaMetadata?.height &&
                  `${file.imageMediaMetadata.height * zoom / 100}px`,
                width: file.imageMediaMetadata?.width &&
                  `${file.imageMediaMetadata.width * zoom / 100}px`,
              })
            }}
          />
        </>
      }
    </Box>
  );
};

export default ImageScreen;
