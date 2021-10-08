import React, {useMemo, useRef, useEffect, useCallback} from 'react';
import Thumbnail, {
  itemToKey
} from './Thumbnail';
import VirtualGrid, {
   VirtualGridRef
} from './VirtualGrid';
import {
  SystemStyleObject
} from '@material-ui/system';

interface ThumbnailsProps {
  files?: gapi.client.drive.File[];
  fileId?: string;
  onSelect: (fileId: string) => void;
  onVisibleFiles?: (indices: number[]) => void;
  sx?: SystemStyleObject;
};

const Thumbnails: React.FC<ThumbnailsProps> = (props) => {
  const {
    files = [],
    fileId,
    onSelect,
    onVisibleFiles,
    sx
  } = props;

  const virtualGridRef = useRef<VirtualGridRef>(null);
  const scrollIndexRef = useRef(0);

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

  const items = useMemo(() => {
    return files.map(
      (file, i) => ({
        file,
        counter: i + 1
      })
    );
  }, [
    files
  ]);
  const onActive = useCallback((index: number) => {
    const file = files[index];
    if (virtualGridRef.current && file.id) {
      scrollIndexRef.current = index;
      virtualGridRef.current.scrollToIndex(index, 'smart');
      onSelect(file.id);
    }
  }, [
    files,
    onSelect
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
    <VirtualGrid
      items={items}
      ItemElement={Thumbnail}
      itemHeight={220}
      numColumns={1}
      center
      itemToKey={itemToKey}
      sx={sx}
      activeIndex={activeIndex}
      onActive={onActive}
      ref={virtualGridRef}
      onVisibleRows={onVisibleFiles}
    />
  );
};

export default Thumbnails;
