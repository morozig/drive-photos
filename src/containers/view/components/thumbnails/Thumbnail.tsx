import React from 'react';

import {
  Box,
  ImageListItemBar
} from '@material-ui/core';

interface ThumbnailProps {
  file: gapi.client.drive.File;
  counter: number,
  isActive: boolean;
  onClick: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = (props: ThumbnailProps) => {
  const {
    file,
    counter,
    isActive,
    onClick
  } = props;

  return (
    <Box
      sx={{
        height: 220,
        width: 220,
        borderRadius: '6px',
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

export default Thumbnail;
