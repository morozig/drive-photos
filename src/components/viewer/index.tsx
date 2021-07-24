import React, { useMemo, useEffect } from 'react';
import {
  SystemStyleObject,
  styled
} from '@material-ui/system';
import {
  Box
} from '@material-ui/core';
import { useScrollActions } from './hooks';
import { FitMode } from '../../App';

const wheelCount = 3;

interface ViewerProps {
  fitMode: FitMode;
  files: any[];
  onNext: () => void;
  onPrev: () => void;
  sx?: SystemStyleObject;
  isScrollToBottom?: boolean;
};

const Img = styled('img')({});

const Viewer: React.FC<ViewerProps> = (props) => {
  const {
    fitMode,
    files,
    onNext,
    onPrev,
    sx,
    isScrollToBottom
  } = props;

  const {
    ref,
    scrollToTop,
    scrollToBottom
  } = useScrollActions({
    wheelCount,
    onScrollOverTop: onPrev,
    onScrollBelowBottom: onNext
  });

  const activeFileId = useMemo(() => {
    return (files.length > 0) ?
      files[0].id as string :
      '';
  }, [
    files
  ]);

  useEffect(() => {
    if (activeFileId && ref.current) {
      if (isScrollToBottom) {
        scrollToBottom();
      } else {
        scrollToTop()
      }
    }
  }, [
    activeFileId,
    ref,
    scrollToTop,
    isScrollToBottom,
    scrollToBottom
  ]);

  return (
    <Box sx={{
      ...sx,
      position: 'relative'
    }}>
      <Box
        sx={{
          textAlign: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto',
          whiteSpace: 'nowrap'
        }}
        ref={ref}
      >
        <Box
          component='span'
          sx={{
            height: '100%',
            verticalAlign: 'middle',
            display: 'inline-block'
          }}
        />
        {files.map((file, i) => (
          <Img
            key={file.id}
            src={file.webContentLink}
            alt={file.name}
            sx={i === 0 ?
              {
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
                })
              } : {
                display: 'none'
              }
            }
            onClick={onNext}
            // onLoad={i === 0 ? onImageLoad : undefined}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Viewer;
