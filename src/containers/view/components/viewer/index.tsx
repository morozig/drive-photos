import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useRef
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
import {
  useTouchScroll,
  useZoom
} from './hooks';
import { FitMode, VisiblePart } from '../..';
import { useFullScreen, useIsTouchScreen } from '../../../../lib/hooks';
import FullscreenEnterIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FitBestIcon from '@material-ui/icons/CropDin';
import FitWidthIcon from '@material-ui/icons/CropPortrait';
import FitHeightIcon from '@material-ui/icons/CropLandscape';
import FitOriginalIcon from '@material-ui/icons/CropOriginal';
import FitManualIcon from '@material-ui/icons/ImageSearch';
import StartSlideshowIcon from '@material-ui/icons/PlayArrow';
import EndSlideshowIcon from '@material-ui/icons/Pause';
import { useDebounce, useRectSize } from '../thumbnails/hooks';
import ZoomSlider from '../zoom-slider';
import ImageScreen, { ImageScreenRef } from '../image-screen';

const delay = 100;
const gap = 20;

export interface ViewerRef {
  toggleFullscreen: () => void;
  scrollVisibleTo: (left: number, top: number) => void;
}

interface ViewerProps {
  fitMode: FitMode;
  fileId: string;
  file?: gapi.client.drive.File;
  canPrev: boolean;
  prevFile?: gapi.client.drive.File;
  canNext: boolean;
  nextFile?: gapi.client.drive.File;
  preloadFiles: gapi.client.drive.File[];
  onNextImage: () => void;
  onPrevImage: () => void;
  onFitModeChange: (fitMode: FitMode) => void;
  sx?: SystemStyleObject;
  isScrollToBottom?: boolean;
  isSlideshowEnabled?: boolean;
  isSlideshowPlaying?: boolean;
  onToggleSlideshowPlaying: () => void;
  onImageError?: () => void;
  onVisibleChange: (options: VisiblePart) => void;
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
    file,
    canPrev,
    prevFile,
    canNext,
    nextFile,
    preloadFiles,
    onNextImage,
    onPrevImage,
    onFitModeChange,
    sx,
    isScrollToBottom,
    isSlideshowEnabled,
    isSlideshowPlaying,
    onToggleSlideshowPlaying,
    onImageError,
    onVisibleChange,
  } = props;

  const [ contextMenu, setContextMenu ] = useState<Point | null>(null);
  const isTouchScreen = useIsTouchScreen();

  const {
    ref: containerRef,
    rectSize: containerRectSize
  } = useRectSize();

  const [ isOverflow, setOverflow ] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentImageScreenRef = useRef<ImageScreenRef>(null);

  useTouchScroll({
    activeIndex: canPrev ? 1 : 0,
    gap,
    ref: scrollContainerRef,
    width: containerRectSize.width,
    contentHash: fileId,
    isEnabled: isTouchScreen,
    onPrevImage,
    onNextImage
  });
  
  const {
    isEnabled,
    isFullscreen,
    toggleFullScreen
  } = useFullScreen();

  useImperativeHandle(viewerRef, () => ({
    toggleFullscreen() {
      if (isEnabled) {
        toggleFullScreen(containerRef.current);
      }
    },
    scrollVisibleTo(left: number, top: number) {
      if (currentImageScreenRef.current) {
        currentImageScreenRef.current.scrollVisibleTo(left, top);
      }
    }
  }), [
    containerRef,
    isEnabled,
    toggleFullScreen,
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
      toggleFullScreen(containerRef.current);
    }
    onClose();
  }, [
    isEnabled,
    containerRef,
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

  const {
    sliderValue,
    sliderScale,
    onSliderChange,
    onZoomMinus,
    onZoomPlus,
    zoom,
    setZoom,
  } = useZoom();

  const prevDebounced = useDebounce(prevFile, isScrollToBottom ? delay : 0);
  const nextDebounced = useDebounce(nextFile, isScrollToBottom ? 0 : delay);
  const fitModeDebounced = useDebounce(fitMode, delay);
  const zoomDebounced = useDebounce(zoom, delay);

  return (
    <Box
      sx={{
        ...sx,
        overflow: 'hidden',
        bgcolor: 'common.black',
        position: 'relative'
      }}
      ref={containerRef}
      onContextMenu={onContextMenu}
    >
      <ImageScreen
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        file={isScrollToBottom ? prevDebounced : nextDebounced}
        containerRectSize={containerRectSize}
        fitMode={fitModeDebounced}
        zoom={zoomDebounced}
        isScrollDisabled
        isPreload
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          bgcolor: 'common.black',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          ...isOverflow ? {
            overflow: 'hidden'
          } : {
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            "::-webkit-scrollbar": {
              display: "none"
            },
          }
        }}
        ref={scrollContainerRef}
      >
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            gap: `${gap}px`,
          }}
        >
          {isTouchScreen && canPrev && 
            <ImageScreen
              key={prevFile?.id || 'prev'}
              sx={{
                flex: '1 0 100%',
                scrollSnapAlign: 'center',
              }}
              file={(prevDebounced?.id !== fileId) ?
                prevDebounced : undefined
              }
              containerRectSize={containerRectSize}
              fitMode={fitModeDebounced}
              zoom={zoomDebounced}
              isScrollDisabled
              onImageError={onImageError}
            />
          }
          <ImageScreen
            key={fileId || 'current'}
            sx={{
              flex: '1 0 100%',
              scrollSnapAlign: 'center',
            }}
            file={file}
            containerRectSize={containerRectSize}
            fitMode={fitMode}
            zoom={zoom}
            isSlideshowPlaying={isSlideshowPlaying}
            onPrevImage={onPrevImage}
            onNextImage={onNextImage}
            onImageError={onImageError}
            onOverflowChanged={setOverflow}
            setZoom={setZoom}
            onVisibleChange={onVisibleChange}
            ref={currentImageScreenRef}
          />
          {isTouchScreen && canNext &&
            <ImageScreen
              key={nextFile?.id || 'next'}
              sx={{
                flex: '1 0 100%',
                scrollSnapAlign: 'center',
              }}
              file={(nextDebounced?.id !== fileId) ?
                nextDebounced : undefined
              }
              containerRectSize={containerRectSize}
              fitMode={fitModeDebounced}
              zoom={zoomDebounced}
              isScrollDisabled
              onImageError={onImageError}
            />
          }
          {preloadFiles.map(file => (
            <Box
              component={'img'}
              key={file.id}
              src={file.webContentLink}
              alt={file.name}
              sx={{
                display: 'none'
              }}
            />
          ))}
        </Box>
      </Box>
      <Menu
        container={containerRef.current}
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
      {fitMode === FitMode.Manual &&
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
