import React, {
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState
} from 'react';
import {
  SystemStyleObject,
  styled
} from '@material-ui/system';
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import { useScrollActions } from './hooks';
import { FitMode } from '../..';
import { useFullScreen } from '../../../../lib/hooks';
import FullscreenEnterIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FitBestIcon from '@material-ui/icons/CropDin';
import FitWidthIcon from '@material-ui/icons/CropPortrait';
import FitHeightIcon from '@material-ui/icons/CropLandscape';
import FitOriginalIcon from '@material-ui/icons/CropOriginal';
import StartSlideshowIcon from '@material-ui/icons/PlayArrow';
import EndSlideshowIcon from '@material-ui/icons/Pause';

const wheelCount = 3;
const slideShowInterval = 5000;

export interface ViewerRef {
  toggleFullscreen: () => void;
}

interface ViewerProps {
  fitMode: FitMode;
  files: any[];
  onNextImage: () => void;
  onPrevImage: () => void;
  onFitModeChange: (fitMode: FitMode) => void;
  sx?: SystemStyleObject;
  isScrollToBottom?: boolean;
  isSlideshowEnabled?: boolean;
  isSlideshowPlaying?: boolean;
  onToggleSlideshowPlaying: () => void;
};

interface Point {
  x: number;
  y: number;
};

const Img = styled('img')({});

const Viewer = forwardRef<ViewerRef, ViewerProps>(
  (props, viewerRef) => {
  const {
    fitMode,
    files,
    onNextImage,
    onPrevImage,
    onFitModeChange,
    sx,
    isScrollToBottom,
    isSlideshowEnabled,
    isSlideshowPlaying,
    onToggleSlideshowPlaying
  } = props;

  const [ contextMenu, setContextMenu ] = useState<Point | null>(null);

  const {
    ref,
    scrollToTop,
    scrollToBottom,
    scrollNextSlide
  } = useScrollActions({
    wheelCount,
    onScrollOverTop: onPrevImage,
    onScrollBelowBottom: onNextImage
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
  
  const {
    isEnabled,
    isFullscreen,
    toggleFullScreen
  } = useFullScreen();
  useImperativeHandle(viewerRef, () => ({
    toggleFullscreen() {
      if (isEnabled) {
        toggleFullScreen(ref.current);
      }
    }
  }), [
    ref,
    isEnabled,
    toggleFullScreen
  ]);

  const onContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setContextMenu(
      prev => !prev ?
        {
          x: e.clientX - 2,
          y: e.clientY - 4
        } :
        null
    );
  }, []);

  const onClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onClickFullscreen = useCallback(() => {
    if (isEnabled) {
      toggleFullScreen(ref.current);
    }
    onClose();
  }, [
    isEnabled,
    ref,
    toggleFullScreen,
    onClose
  ]);

  const onClickFitBest = useCallback(() => {
    onFitModeChange(FitMode.Best);
    onClose();
  }, [
    onFitModeChange,
    onClose
  ]);
  const onClickFitWidth = useCallback(() => {
    onFitModeChange(FitMode.Width);
    onClose();
  }, [
    onFitModeChange,
    onClose
  ]);
  const onClickFitHeight = useCallback(() => {
    onFitModeChange(FitMode.Height);
    onClose();
  }, [
    onFitModeChange,
    onClose
  ]);
  const onClickFitOriginal = useCallback(() => {
    onFitModeChange(FitMode.Original);
    onClose();
  }, [
    onFitModeChange,
    onClose
  ]);
  const onClickSlideshow = useCallback(() => {
    onToggleSlideshowPlaying();
    onClose();
  }, [
    onToggleSlideshowPlaying,
    onClose
  ]);

  return (
    <Box sx={{
      ...sx,
      position: 'relative'
    }}>
      <Box
        component='div'
        onContextMenu={onContextMenu}
        sx={{
          textAlign: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto',
          whiteSpace: 'nowrap',
          ...(files.length > 0 && {
            bgcolor: 'common.black'
          })
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
            onClick={onNextImage}
            // onLoad={i === 0 ? onImageLoad : undefined}
          />
        ))}
        <Menu
          container={ref.current}
          disableScrollLock={true}
          open={!!contextMenu}
          onClose={onClose}
          anchorReference='anchorPosition'
          anchorPosition={!!contextMenu ?
            {
              top: contextMenu.y,
              left: contextMenu.x
            } :
            undefined
          }
        >
          {isEnabled &&
            <MenuItem
              onClick={onClickFullscreen}
            >
              <ListItemIcon>
                {isFullscreen ?
                  <FullscreenExitIcon /> :
                  <FullscreenEnterIcon />
                }
              </ListItemIcon>
              <ListItemText>
                {isFullscreen ?
                  'Exit Fullscreen' :
                  'Enter Fullscreen'
                }
              </ListItemText>
            </MenuItem>
          }
          {isSlideshowEnabled &&
            <MenuItem
              onClick={onClickSlideshow}
            >
              <ListItemIcon>
                {isSlideshowPlaying ?
                  <EndSlideshowIcon/> :
                  <StartSlideshowIcon/>
                }
              </ListItemIcon>
              <ListItemText>
                {isSlideshowPlaying ?
                  'End Slideshow' :
                  'Start Slideshow'
                }
              </ListItemText>
            </MenuItem>
          }
          <MenuItem
            onClick={onClickFitBest}
          >
            <ListItemIcon>
              <FitBestIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Best Fit'}
            </ListItemText>
          </MenuItem>
          <MenuItem
            onClick={onClickFitWidth}
          >
            <ListItemIcon>
              <FitWidthIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Fit Width'}
            </ListItemText>
          </MenuItem>
          <MenuItem
            onClick={onClickFitHeight}
          >
            <ListItemIcon>
              <FitHeightIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Fit Height'}
            </ListItemText>
          </MenuItem>
          <MenuItem
            onClick={onClickFitOriginal}
          >
            <ListItemIcon>
              <FitOriginalIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Original Size'}
            </ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
});

export default Viewer;
