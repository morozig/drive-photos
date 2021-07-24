import React from 'react';

import {
  Box
} from '@material-ui/core';

interface ThumbnailProps {
  file: any;
  isActive: boolean;
  onClick: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = (props: ThumbnailProps) => {
  const {
    file,
    isActive,
    onClick
  } = props;

  return (
    <Box
      sx={{
        height: 220,
        width: 220,
        borderRadius: 1,
        bgcolor: isActive ? 'grey.200' : 'grey.400',
        boxSizing: 'border-box',
        display: 'grid',
        alignContent: 'center',
        justifyContent: 'center'
      }}
      onClick={onClick}
    >
      <img
        src={file.thumbnailLink}
        alt={file.name}
      />
    </Box>
  );
};

export default Thumbnail;
