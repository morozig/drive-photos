import React, { 
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { useBrowserScrollbarWidth } from '../../../../lib/hooks';

const wheelCount = 3;
const slideShowInterval = 5000;
const zoomStep = 0.4;

interface FixedPoint {
  localZoom: number;
  offsetX: number;
  offsetY: number;
  scrollX: number;
  scrollY: number;
}

interface ImageScreenProps {
  file?: gapi.client.drive.File;
  containerRectSize: RectSize,
  fitMode?: FitMode;
  zoom?: number;
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
    isSlideshowPlaying,
    isScrollDisabled,
    onPrevImage,
    onNextImage,
    onImageError,
    isPreload,
    onOverflowChanged,
    sx,
  } = props;

  const [ localZoom, setLocalZoom ] = useState(0);
  const modeZoomRef = useRef(zoom);
  const scrollbarWidth = useBrowserScrollbarWidth();
  const isOferflowRef = useRef(false);

  const {
    ref,
    scrollNextSlide,
  } = useScrollActions({
    isDisabled: isScrollDisabled,
    wheelCount,
    onScrollOverTop: onPrevImage,
    onScrollBelowBottom: onNextImage,
    isOverflow: isOferflowRef.current,
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
    if (!file || !file.imageMediaMetadata ||
      !file.imageMediaMetadata.width ||
      !file.imageMediaMetadata.height ||
      !containerRectSize.width ||
      !containerRectSize.height
    ) {
      return;
    }

    const imageWidth = file.imageMediaMetadata.width;
    const imageHeight = file.imageMediaMetadata.height;
    const {
      width,
      height
    } = containerRectSize;

    if (fitMode === FitMode.Best) {
      const horizontalScale = (imageWidth > width) ?
        width / imageWidth : 1;
      const verticalScale = (imageHeight > height) ?
        height / imageHeight : 1;
      const scale = Math.min(horizontalScale, verticalScale);
      modeZoomRef.current = scale * 100;
    } else if (fitMode === FitMode.Width) {
      let scale = 1;
      if (imageWidth > width) {
        scale = width / imageWidth;
        const scaledHeight = imageHeight * scale;
        if (scaledHeight > height && width > scrollbarWidth) {
          scale = (width - scrollbarWidth) / imageWidth;
        }
      }
      modeZoomRef.current = scale * 100;
    } else if (fitMode === FitMode.Height) {
      let scale = 1;
      if (imageHeight > height) {
        scale = height / imageHeight;
        const scaledWidth = imageWidth * scale;
        if (scaledWidth > width && height > scrollbarWidth) {
          scale = (height - scrollbarWidth) / imageHeight;
        }
      }
      modeZoomRef.current = scale * 100;
    } else if (fitMode === FitMode.Original) {
      let scale = 1;
      modeZoomRef.current = scale * 100;
    } else if (fitMode === FitMode.Manual) {
      modeZoomRef.current = zoom;
    }
    setLocalZoom(modeZoomRef.current);
  }, [
    containerRectSize,
    file,
    fitMode,
    scrollbarWidth,
    zoom,
  ]);

  const {
    imageWidth,
    imageHeight,
    left,
    top,
  } = useMemo(() => {
    if (!file || !file.imageMediaMetadata ||
      !file.imageMediaMetadata.width ||
      !file.imageMediaMetadata.height ||
      !containerRectSize.width ||
      !containerRectSize.height
    ) {
      return {
        imageWidth: 0,
        imageHeight: 0,
        left: 0,
        top: 0,
      };
    } else {
      const imageWidth = file.imageMediaMetadata.width * localZoom / 100;
      const imageHeight = file.imageMediaMetadata.height * localZoom / 100;
      const isHorizontalScroll = imageWidth > containerRectSize.width;
      const isVerticalScroll = imageHeight > containerRectSize.height;
      const clientWidth = isVerticalScroll ?
        containerRectSize.width - scrollbarWidth :
        containerRectSize.width;
      const clientHeight = isHorizontalScroll ?
        containerRectSize.height - scrollbarWidth :
        containerRectSize.height;
      const left = imageWidth < clientWidth ?
        (clientWidth - imageWidth) / 2 : 0;
      const top = imageHeight < clientHeight ?
        (clientHeight - imageHeight) / 2 : 0;
      return {
        imageWidth,
        imageHeight,
        left,
        top,
      };
    }
  }, [
    containerRectSize.width,
    containerRectSize.height,
    file,
    localZoom,
    scrollbarWidth,
  ]);

  useEffect(() => {
    if (imageWidth && containerRectSize.width) {
      isOferflowRef.current = imageWidth > containerRectSize.width;
      if (onOverflowChanged) {
        onOverflowChanged(isOferflowRef.current);
      }
    }
  }, [
    onOverflowChanged,
    imageWidth,
    containerRectSize.width
  ]);

  const fixedPointRef = useRef<FixedPoint | null>(null);
  useEffect(() => {
    const div = ref.current;
    if (!div) {
      return;
    }

    const saveFixedPoint = (e: WheelEvent, localZoom: number) => {
      fixedPointRef.current = {
        localZoom,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        scrollX: div.scrollLeft,
        scrollY: div.scrollTop,
      };
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) {
        return;
      } else {
        e.preventDefault();
      }

      if (e.deltaY < 0) {
        setLocalZoom(current => {
          const newLocalZoom = Math.min(100, current * (1 + zoomStep));
          if (newLocalZoom !== current) {
            saveFixedPoint(e, current);
          }
          return newLocalZoom;
        })
      } else if (e.deltaY > 0) {
        setLocalZoom(current => {
          const newLocalZoom = Math.max(modeZoomRef.current, current * (1 - zoomStep));
          if (newLocalZoom !== current) {
            saveFixedPoint(e, current);
          }
          return newLocalZoom;
        })
      }
    };

    div.addEventListener('wheel', onWheel);
    return () => div.removeEventListener('wheel', onWheel);
  }, [
    ref,
  ]);

  useEffect(() => {
    const fixedPoint = fixedPointRef.current;
    const div = ref.current;
    if (!fixedPoint || !div || !fixedPoint.localZoom || !localZoom) {
      return;
    }
    const offsetX = fixedPoint.offsetX / fixedPoint.localZoom * localZoom;
    const offsetY = fixedPoint.offsetY / fixedPoint.localZoom * localZoom;
    const scrollX = fixedPoint.scrollX - fixedPoint.offsetX + offsetX;
    const scrollY = fixedPoint.scrollY - fixedPoint.offsetY + offsetY;
    div.scroll(scrollX, scrollY);
    fixedPointRef.current = null;
  }, [
    localZoom,
    ref,
  ]);

  const touchesRef = useRef<PointerEvent[]>([]);
  const diffRef = useRef(-1);

  useEffect(() => {
    const div = ref.current;
    if (!div) {
      return;
    }

    const saveFixedPoint = (
      center: {
        offsetX: number,
        offsetY: number,
      },
      localZoom: number
    ) => {
      fixedPointRef.current = {
        localZoom,
        offsetX: center.offsetX,
        offsetY: center.offsetY,
        scrollX: div.scrollLeft,
        scrollY: div.scrollTop,
      };
    };
    
    const onPointerDown = (e: PointerEvent) => {
      touchesRef.current.push(e);
    };

    const onPointerMove = (e: PointerEvent) => {
      for (let i = 0; i < touchesRef.current.length; i++) {
        if (e.pointerId === touchesRef.current[i].pointerId) {
          touchesRef.current[i] = e;
          break;
        }
      }
      
      if (touchesRef.current.length === 2) {
        const newDiff = Math.sqrt(
          Math.pow(
            touchesRef.current[0].clientX - touchesRef.current[1].clientX,
            2
          ) + 
          Math.pow(
            touchesRef.current[0].clientY - touchesRef.current[1].clientY,
            2
          )
        );

        const center = {
          offsetX: (
            touchesRef.current[0].offsetX + touchesRef.current[1].offsetX
          ) / 2,
          offsetY: (
            touchesRef.current[0].offsetY + touchesRef.current[1].offsetY
          ) / 2
        }

        if (diffRef.current && diffRef.current > 0) {
          if (newDiff > diffRef.current) {
            setLocalZoom(current => {
              const newLocalZoom = Math.min(
                100,
                current * newDiff / diffRef.current
              );
              if (newLocalZoom !== current) {
                saveFixedPoint(center, current);
              }
              return newLocalZoom;
            })
          } else if (newDiff < diffRef.current) {
            setLocalZoom(current => {
              const newLocalZoom = Math.max(
                modeZoomRef.current,
                current * newDiff / diffRef.current
              );
              if (newLocalZoom !== current) {
                saveFixedPoint(center, current);
              }
              return newLocalZoom;
            })
          }
        }

        diffRef.current = newDiff;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      for (let i = 0; i < touchesRef.current.length; i++) {
        if (e.pointerId === touchesRef.current[i].pointerId) {
          touchesRef.current.splice(i, 1);
          break;
        }
      }

      if (touchesRef.current.length < 2) {
        diffRef.current = -1;
      }
    };

    div.addEventListener('pointerdown', onPointerDown);
    div.addEventListener('pointermove', onPointerMove);
    div.addEventListener('pointerup', onPointerUp);
    div.addEventListener('pointercancel', onPointerUp);
    div.addEventListener('pointerout', onPointerUp);
    div.addEventListener('pointerleave', onPointerUp);
    return () => {
      div.removeEventListener('pointerdown', onPointerDown);
      div.removeEventListener('pointermove', onPointerMove);
      div.removeEventListener('pointerup', onPointerUp);
      div.removeEventListener('pointercancel', onPointerUp);
      div.removeEventListener('pointerout', onPointerUp);
      div.removeEventListener('pointerleave', onPointerUp);
    };
  }, [
    ref,
  ]);

  return (
    <Box
      sx={{
        textAlign: 'center',
        overflow: 'auto',
        whiteSpace: 'nowrap',
        position: 'relative',
        touchAction: 'pan-x pan-y',
        ...sx
      }}
      ref={ref}
    >
      {!!file && localZoom > 0 &&
        <>
          {!isPreload &&
            <ImageSkeleton
              width={imageWidth}
              height={imageHeight}
              sx={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
              }}
            />
          }
          <Box
            component={'img'}
            key={file.id}
            src={file.webContentLink}
            alt={file.name}
            onClick={onNextImage}
            onError={onImageError}
            sx={{
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              height: `${imageHeight}px`,
              width: `${imageWidth}px`,
            }}
          />
        </>
      }
    </Box>
  );
};

export default ImageScreen;
