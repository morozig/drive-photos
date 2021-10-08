import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo
} from 'react'
import { useRectSize, useScroll } from './hooks';
import {
  Box,
} from '@material-ui/core';
import {
  SystemStyleObject
} from '@material-ui/system';

type ScrollToBlock = 'center' | 'smart';

export interface VirtualGridRef {
  scrollToIndex: (index: number, block?:  ScrollToBlock) => void;
}

export interface ItemProps<Item> {
  item: Item;
  isActive: boolean;
  onClick: () => void;
}

interface VirtualGridProps<Item> {
  items: Item[];
  itemHeight: number;
  itemWidth?: number;
  ItemElement: React.FC<ItemProps<Item>>;
  itemToKey: (item: Item) => React.Key;
  activeIndex: number;
  onActive: (index: number) => void;
  scrollToIndex?: number;
  onVisibleRows?: (rows: number[]) => void;
  numColumns?: number;
  center?: boolean;
  sx?: SystemStyleObject;
}

const columnGap = 4;
const rowGap = 4;
const scrollBarWidth = 20;
const rowsAhead = 1;

const VirtualGridInner = <Item,>(
  props: VirtualGridProps<Item>,
  virtualGridRef?: React.ForwardedRef<VirtualGridRef>
) => {
  const {
    items,
    itemHeight,
    itemWidth,
    ItemElement,
    itemToKey,
    activeIndex,
    onActive,
    scrollToIndex,
    onVisibleRows,
    numColumns,
    center,
    sx
  } = props;

  const {
    ref,
    rectSize
  } = useRectSize();

  const {
    width,
    height
  } = useMemo(() => ({...rectSize}), [
    rectSize
  ]);

  const itemsCount = items.length;

  const itemsInRow = numColumns ?
    numColumns :
    (width && itemWidth) ?
      Math.floor(
        (width + columnGap - scrollBarWidth) /
        (itemWidth + columnGap)
      ) : 1;

  const rowsCount = Math.ceil(itemsCount / itemsInRow);

  const {
    scrollTop,
    isScrolling
  }= useScroll(ref);

  const totalHeight = rowsCount * itemHeight +
    (rowsCount - 1) * rowGap;
  const startRow = Math.max(
    0,
    Math.floor(scrollTop / (itemHeight + rowGap)) - rowsAhead
  );
  const startItem = startRow * itemsInRow;

  const visibleItemsCount = Math.min(
    itemsCount - startItem,
    (
      rowsAhead + (
        Math.ceil(height / (itemHeight + rowGap)) + 2 * rowsAhead
      ) + rowsAhead
    ) * itemsInRow
  );

  const offsetY = startRow * (itemHeight + rowGap);

  const firstVisibleRow = Math.floor(
    (scrollTop) / (itemHeight + rowGap)
  );
  const lastVisibleRow = Math.floor(
    (scrollTop + height) / (itemHeight + rowGap)
  );

  useEffect(() => {
    if (onVisibleRows) {
      const visibleRows = [] as number[];
      for (let i = firstVisibleRow; i <= lastVisibleRow; i++) {
        visibleRows.push(i);
      }
      onVisibleRows(visibleRows);
    }
  }, [
    firstVisibleRow,
    lastVisibleRow,
    onVisibleRows
  ]);

  const visibleItems = useMemo(() => items
    .slice(startItem, startItem + visibleItemsCount)
    .map((item, i) => (
      <ItemElement
        key={itemToKey(item)}
        item={item}
        isActive={startItem + i === activeIndex}
        onClick={() => {
          onActive(startItem + i)
        }}
      />
    )),[
      ItemElement,
      activeIndex,
      itemToKey,
      items,
      onActive,
      startItem,
      visibleItemsCount
  ]);

  const gridTemplateColumns = width ?
    `repeat(${itemsInRow}, ${itemWidth}px)` :
    `repeat(auto-fill, ${itemWidth}px)`;

  const doScrollToIndex = useCallback(
    (scrollToIndex: number, block = 'center') => {
      // console.log('doScrollToIndex', {scrollToIndex, block});
      const scrollToRow = scrollToIndex &&
        Math.floor(scrollToIndex / itemsInRow);
      let scrollOffset = 0;
      if (block === 'smart') {
        const scrollToRowTop = scrollToRow &&
          Math.ceil(scrollToRow * (itemHeight + rowGap));
        const scrollToRowBottom = scrollToRowTop + itemHeight;
        const scrollBottom = scrollTop + height;

        // console.log({scrollToRowTop, scrollBottom, height, itemHeight});

        if (scrollToRowTop >= scrollTop && scrollToRowBottom <= scrollBottom) {
          return scrollTop;
        } else if (scrollToRowBottom > scrollTop && scrollToRowTop < scrollTop) {
          scrollOffset = 0
        } else if (scrollToRowTop < scrollBottom && scrollToRowBottom > scrollBottom) {
          scrollOffset = height - itemHeight;
        }
      } else {
        scrollOffset = Math.ceil(height / 2 - itemHeight / 2);
      }
      const scrollTo = scrollToIndex && scrollToRow &&
        Math.ceil(scrollToRow * (itemHeight + rowGap)) -
          scrollOffset;
          
      if (ref.current) {
        const div = ref.current;
        div.scroll(0, scrollTo);
      }
  }, [
    ref,
    height,
    itemHeight,
    itemsInRow,
    scrollTop
  ]);

  useImperativeHandle(virtualGridRef, () => ({
    scrollToIndex(index: number, block = 'center') {
      doScrollToIndex(index, block);
    }
  }), [
    doScrollToIndex
  ]);

  useEffect(() => {
    if (scrollToIndex !== undefined) {
      doScrollToIndex(scrollToIndex);
    }
  }, [
    doScrollToIndex,
    scrollToIndex
  ]);

  return (
    <Box
      component={'div'}
      ref={ref}
      sx={{
        ...sx,
        overflowY: 'auto',
        willChange: 'transform'
      }}
    >
      {width ?
        <Box
          component={'div'}
          sx={{
            overflow: 'hidden',
            position: 'relative',
            height: `${totalHeight}px`,
            pointerEvents: isScrolling ? 'none' : undefined
          }}
        >
          <Box
            component={'div'}
            sx={{
              width: '100%',
              position: 'absolute',
              display: 'grid',
              gap: '4px',
              top: `${offsetY}px`,
              gridTemplateColumns,
              ...(center && {
                justifyContent: 'center',
                justifyItems: 'center'
              })
            }}
          >
            {visibleItems}
          </Box>
        </Box> : null
      }
    </Box>
  );
};

const VirtualGrid = forwardRef(VirtualGridInner) as <Item>(
  props: VirtualGridProps<Item> & {
    ref?: React.ForwardedRef<VirtualGridRef>
  }
) => ReturnType<typeof VirtualGridInner>;


export default VirtualGrid;
