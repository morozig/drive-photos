import React from 'react';

import {
  Box,
  ImageListItemBar
} from '@material-ui/core';
import { ItemProps } from './VirtualGrid';

interface GridItem {
  file: gapi.client.drive.File;
  counter: number;
  onImageError?: () => void;
}

type ThumbnailProps = ItemProps<GridItem>;

export const itemToKey = (item: GridItem) => item.file.name || item.counter;

const ThumbnailInner: React.FC<ThumbnailProps> = (props) => {
  const {
    item,
    isActive,
    onClick
  } = props;

  const {
    file,
    counter,
    onImageError
  } = item;

  return (
    <Box
      sx={{
        height: 220,
        width: 220,
        borderRadius: '6px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'grid',
        alignContent: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...(isActive ?
          {
            bgcolor: 'common.black'
          } :
          {
            border: '1px solid #dadce0'
          }
        )
      }}
      onClick={onClick}
    >
      <img
        src={file.thumbnailLink}
        alt={file.name}
        onError={onImageError}
      />
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
    </Box>
  );
};

const Thumbnail = React.memo(ThumbnailInner,
  (prevProps, nextProps) => {
    const areEqual = (
      (prevProps.item.file.id === nextProps.item.file.id) &&
      (prevProps.isActive === nextProps.isActive)
    );
    return areEqual;
  }
);


export default Thumbnail;
