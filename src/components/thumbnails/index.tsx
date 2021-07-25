import React, {useMemo, useRef, useEffect} from 'react';
import { Box } from '@material-ui/core';
import { useRectSize } from './hooks';
import Thumbnail from './Thumbnail';
import VirtualGrid, { ItemProps, VirtualGridRef } from './VirtualGrid';
import {
  SystemStyleObject
} from '@material-ui/system'

interface ThumbnailsProps {
  files?: any[];
  fileId?: string;
  onSelect: (fileId: string) => void;
  sx?: SystemStyleObject;
};

const Thumbnails: React.FC<ThumbnailsProps> = (props) => {
  const {
    files = [],
    fileId,
    onSelect,
    sx
  } = props;

  const virtualGridRef = useRef<VirtualGridRef>(null);
  const scrollIndexRef = useRef(0);

  const Item = useMemo(() => {
    return ({index}: ItemProps) => {
      const file = files[index];
      const isActive = fileId === file.id;

      return (
        <Thumbnail
          file={file}
          counter={index + 1}
          isActive={isActive}
          onClick={() => {
            if (virtualGridRef.current) {
              scrollIndexRef.current = index;
              virtualGridRef.current.scrollToIndex(index, 'smart');
            }
            onSelect(file.id);
          }}
        />
      );
    };
  }, [
    files,
    fileId,
    onSelect
  ]);

  const { ref, rectSize } = useRectSize();
  const activeIndex = useMemo(() => {
    if (fileId && files && files.length > 0) {
      return files.findIndex(file => file.id === fileId);
    } else {
      return -1;
    }
  }, [
    fileId,
    files
  ]);

  useEffect(() => {
    if (virtualGridRef.current && activeIndex !== scrollIndexRef.current) {
      scrollIndexRef.current = activeIndex;
      virtualGridRef.current.scrollToIndex(activeIndex);
    }
  }, [
    activeIndex
  ]);

  return (
    <Box
      ref={ref}
      sx={sx}
    >
      {(files.length > 0 && rectSize.height > 0) &&
        <VirtualGrid
          Item={Item}
          height={rectSize.height}
          itemHeight={220}
          itemsCount={files.length}
          rowsAhead={3}
          center
          rowGap={4}
          ref={virtualGridRef}
        />
      }
    </Box>
  );
};

export default Thumbnails;