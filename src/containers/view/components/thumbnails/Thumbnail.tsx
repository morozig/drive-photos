import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  ImageListItemBar
} from '@material-ui/core';
import { ItemProps } from './VirtualGrid';
import { VisiblePart, VisiblePartHandler } from '../..';

const size = 220;

interface GridItem {
  file: gapi.client.drive.File;
  counter: number;
  onImageError?: () => void;
  subVisiblePart?: (cb: VisiblePartHandler) => void;
  onMoveVisible?: (left: number, top: number) => void;
}

type ThumbnailProps = ItemProps<GridItem>;

export const itemToKey = (item: GridItem) => item.file.id || item.counter;

const ThumbnailInner: React.FC<ThumbnailProps> = (props) => {
  const {
    item,
    isActive,
    onClick,
  } = props;

  const {
    file,
    counter,
    onImageError,
    subVisiblePart,
    onMoveVisible,
  } = item;

  const [ visiblePart, setVisiblePart ] = useState<VisiblePart>({
    width: 1,
    height: 1,
    left: 0,
    top: 0,
  });
  const [ isGrabbing, setGrabbing ] = useState(false);

  const onVisiblePartChanged = useCallback((visiblePart: VisiblePart) => {
    if (!isGrabbing) {
      requestAnimationFrame(() => {
        setVisiblePart(visiblePart);
      });
    }
  }, [
    isGrabbing,
  ]);

  useEffect(() => {
    if (isActive && subVisiblePart) {
      return subVisiblePart(onVisiblePartChanged);
    }
  }, [
    isActive,
    subVisiblePart,
    onVisiblePartChanged,
  ]);

  const {
    widthPart,
    heightPart
  } = useMemo(() => {
    let widthPart = 1;
    let heightPart = 1;
    if (!isActive || !file.imageMediaMetadata ||
      !file.imageMediaMetadata.width ||
      !file.imageMediaMetadata.height
    ) {
      return {
        widthPart,
        heightPart
      };
    } else {
      if (file.imageMediaMetadata.width < file.imageMediaMetadata.height) {
        widthPart = file.imageMediaMetadata.width /
          file.imageMediaMetadata.height;
      } else {
        heightPart = file.imageMediaMetadata.height /
          file.imageMediaMetadata.width;
      }
      return {
        widthPart,
        heightPart
      }
    }
  }, [
    isActive,
    file.imageMediaMetadata
  ]);

  const onMouseDown = useCallback(() => {
    setGrabbing(true);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isActive || !isGrabbing || !onMoveVisible) {
        return;
      }
      requestAnimationFrame(() => {
        setVisiblePart(current => {
          let {
            width,
            height,
            left,
            top
          } = current;
  
          left = e.movementX < 0 ?
            Math.max(0, left + e.movementX / size) :
            Math.min(1 - width, left + e.movementX / size);
          top = e.movementY < 0 ?
            Math.max(0, top + e.movementY / size) :
            Math.min(1 - height, top + e.movementY / size);
          if (current.left !== left || current.top !== top) {
            onMoveVisible(left, top);
            return {
              ...current,
              left,
              top,
            };
          } else {
            return current;
          }
        });
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [
    isActive,
    isGrabbing,
    onMoveVisible,
  ]);

  useEffect(() => {
    const onMouseUp = () => setGrabbing(false);

    if (isActive) {
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('mouseleave', onMouseUp);
      document.addEventListener('mouseout', onMouseUp);
      return () => {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mouseleave', onMouseUp);
        document.removeEventListener('mouseout', onMouseUp);
      }
    }
  }, [
    isActive,
  ]);

  const {
    left,
    top,
    width,
    height,
  } = useMemo(() => {
    const left = (1 - widthPart) / 2 +
      visiblePart.left * widthPart;
    const top = (1 - heightPart) / 2 +
      visiblePart.top * heightPart;
    const width = widthPart * visiblePart.width;
    const height = heightPart * visiblePart.height;
    return {
      left,
      top,
      width,
      height,
    };
  }, [
    widthPart,
    heightPart,
    visiblePart
  ]);

  return (
    <Box
      sx={{
        height: `${size}px`,
        width: `${size}px`,
        borderRadius: '6px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        ...(isActive ?
          {
            bgcolor: 'common.black'
          } :
          {
            border: '1px solid #dadce0',
            cursor: 'pointer',
          }
        )
      }}
      onClick={onClick}
    >
      <Box
        component={'img'}
        src={file.thumbnailLink}
        alt={file.name}
        onError={onImageError}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {(isActive && (visiblePart.width < 1 || visiblePart.height < 1)) ?
        <>
          <Box
            sx={{
              position: 'absolute',
              top: '0',
              right: '0',
              bottom: '0',
              left: '0',
              background: 'rgba(0, 0, 0, 0.5)',
              clipPath: `polygon(0% 0%, 0% 100%, ${
                left * 100}% 100%, ${
                left * 100}% ${top * 100}%, ${
                (left + width) * 100}% ${top * 100}%, ${
                (left + width) * 100}% ${(top + height) * 100}%, ${
                left * 100}% ${(top + height) * 100}%, ${
                left * 100}% 100%, 100% 100%, 100% 0%)`,
            }}
          >
            <ImageListItemBar
              title={file.name}
              subtitle={`#${counter}`}
              sx={{
                background: 'transparent',
              }}
            />
          </Box>
          <Box
            component={'div'}
            onMouseDown={onMouseDown}
            sx={{
              position: 'absolute',
              left: `${left * 100}%`,
              top: `${top * 100}%`,
              width: `${width * 100}%`,
              height: `${height * 100}%`,
              cursor: isGrabbing ? 'grabbing' : 'grab',
              border: '2px solid white',
              boxSizing: 'border-box',
            }}
          />
        </> :
        <ImageListItemBar
          title={file.name}
          subtitle={`#${counter}`}
          sx={{
            ...(!isActive &&
              {
                background: 'rgba(255, 255, 255, 0.5)',
                [`& .MuiImageListItemBar-titleWrap`]: {
                  color: 'common.black'
                }
              }
            )
          }}
        />
      }
    </Box>
  );
};

const Thumbnail = React.memo(ThumbnailInner,
  (prevProps, nextProps) => {
    const areEqual = (
      (prevProps.item.file.id === nextProps.item.file.id) &&
      (prevProps.item.counter === nextProps.item.counter) &&
      (prevProps.isActive === nextProps.isActive)
    );
    return areEqual;
  }
);


export default Thumbnail;
