import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from 'react';
import {
  SystemStyleObject,
} from '@material-ui/system';
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { useDelayedId, useScrollActions, useZoom } from './hooks';
import { FitMode } from '../..';
import { useFullScreen } from '../../../../lib/hooks';
import FullscreenEnterIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FitBestIcon from '@material-ui/icons/CropDin';
import FitWidthIcon from '@material-ui/icons/CropPortrait';
import FitHeightIcon from '@material-ui/icons/CropLandscape';
import FitOriginalIcon from '@material-ui/icons/CropOriginal';
import FitManualIcon from '@material-ui/icons/ImageSearch';
import StartSlideshowIcon from '@material-ui/icons/PlayArrow';
import EndSlideshowIcon from '@material-ui/icons/Pause';
import ImageSkeleton from '../image-skeleton';
import { useRectSize } from '../thumbnails/hooks';
import ZoomSlider from '../zoom-slider';

const wheelCount = 3;
const slideShowInterval = 5000;
export interface ViewerRef {
  toggleFullscreen: () => void;
}

interface ViewerProps {
  fitMode: FitMode;
  fileId: string;
  files: gapi.client.drive.File[];
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

const Viewer = forwardRef<ViewerRef, ViewerProps>(
  (props, viewerRef) => {
  const {
    fitMode,
    fileId,
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

  useEffect(() => {
    if (fileId && ref.current) {
      if (isScrollToBottom) {
        scrollToBottom();
      } else {
        scrollToTop()
      }
    }
  }, [
    fileId,
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
  const onClickFitManual = useCallback(() => {
    onFitModeChange(FitMode.Manual);
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
  const preRenderId = useDelayedId(files[1]);
  const {
    ref: backRef,
    rectSize: backRectSize
  } = useRectSize();
  const {
    sliderValue,
    sliderScale,
    onSliderChange,
    onZoomMinus,
    onZoomPlus,
    zoom
  } = useZoom();

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
          zIndex: 1,
          ...(!!fileId && {
            bgcolor: 'common.black'
          })
        }}
        ref={ref}
      >
        <Box
          component='div'
          key={'back'}
          ref={backRef}
          onClick={onNextImage}
          sx={{
            textAlign: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            whiteSpace: 'nowrap',
            zIndex: -1,
            bgcolor: 'common.black'
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
            files[0] && files[0].imageMediaMetadata &&
            files[0].imageMediaMetadata.width && files[0].imageMediaMetadata.height &&
            <ImageSkeleton
              width={files[0].imageMediaMetadata.width}
              height={files[0].imageMediaMetadata.height}
              containerRectSize={backRectSize}
              fitMode={fitMode}
              zoom={zoom}
              sx={{
                verticalAlign: 'middle'
              }}
            />
          }
        </Box>
        <Box
          component='span'
          sx={{
            height: '100%',
            verticalAlign: 'middle',
            display: 'inline-block'
          }}
        />
        {files.map((file, i) => (
          <Box
            component={'img'}
            key={file.id}
            src={file.webContentLink}
            alt={file.name}
            onClick={onNextImage}
            sx={i <= 1 ?
              {
                verticalAlign: 'middle',
                zIndex: 1,
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
                }),
                ...(i === 1 && file.id === preRenderId && {
                  position: 'fixed',
                  zIndex: -2,
                  bottom: '99vh',
                  right: '20px'
                }),
                ...(i === 1 && file.id !== preRenderId && {
                  display: 'none'
                }),
              } : {
                display: 'none'
              }
            }
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
            sx={{
              backgroundColor: fitMode === FitMode.Best ?
                'rgba(0, 0, 0, 0.08)' : undefined
            }}
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
            sx={{
              backgroundColor: fitMode === FitMode.Width ?
                'rgba(0, 0, 0, 0.08)' : undefined
            }}
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
            sx={{
              backgroundColor: fitMode === FitMode.Height ?
                'rgba(0, 0, 0, 0.08)' : undefined
            }}
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
            sx={{
              backgroundColor: fitMode === FitMode.Original ?
                'rgba(0, 0, 0, 0.08)' : undefined
            }}
          >
            <ListItemIcon>
              <FitOriginalIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Original Size'}
            </ListItemText>
          </MenuItem>
          <MenuItem
            onClick={onClickFitManual}
            sx={{
              backgroundColor: fitMode === FitMode.Manual ?
                'rgba(0, 0, 0, 0.08)' : undefined
            }}
          >
            <ListItemIcon>
              <FitManualIcon/>
            </ListItemIcon>
            <ListItemText>
              {'Manual Zoom'}
            </ListItemText>
          </MenuItem>
        </Menu>
        {fitMode === FitMode.Manual && isFullscreen &&
          <ZoomSlider
            sliderValue={sliderValue}
            onSliderChange={onSliderChange}
            sliderScale={sliderScale}
            onZoomMinus={onZoomMinus}
            onZoomPlus={onZoomPlus}
            sx={{
              position: 'fixed'
            }}
          />
        }
      </Box>
      {fitMode === FitMode.Manual && !isFullscreen &&
        <ZoomSlider
          sliderValue={sliderValue}
          onSliderChange={onSliderChange}
          sliderScale={sliderScale}
          onZoomMinus={onZoomMinus}
          onZoomPlus={onZoomPlus}
        />
      }
    </Box>
  );
});

export default Viewer;
