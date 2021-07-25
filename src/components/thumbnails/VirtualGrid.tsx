import React, {
  useMemo,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react';
import './VirtualGrid.css';
import { useScrollAware } from './hooks';

export interface ItemProps {
  index: number;
}

type ScrollToBlock = 'center' | 'smart';

export interface VirtualGridRef {
  scrollToIndex: (index: number, block?:  ScrollToBlock) => void;
}

interface VirtualGridProps {
  Item: React.FC<ItemProps>;
  itemsCount: number;
  height: number;
  itemHeight: number;
  rowsAhead: number;
  rowGap?: number;
  columnGap?: number;
  width?: number;
  itemWidth?: number;
  className?: string;
  scrollBar?: 'right' | 'left' | 'none',
  scrollToIndex?: number;
  onVisibleRows?: (rows: number[]) => void;
  center?: boolean;
}

const scrollBarWidth = 19;

const VirtualGrid = forwardRef<VirtualGridRef, VirtualGridProps>(
  (props, scrollRef) => {
  const {
    Item,
    height,
    itemHeight,
    itemsCount,
    rowsAhead,
    rowGap = 0,
    columnGap = 0,
    width,
    itemWidth,
    scrollBar = 'right',
    scrollToIndex,
    onVisibleRows,
    center = false
  } = props;

  const className = 'VirtualGrid '.concat(
    props.className ? `${props.className} ` : '',
    `VirtualGrid--${scrollBar}`
  );

  const itemsInRow = (width && itemWidth && width > itemWidth) ?
    Math.floor((width + columnGap - scrollBarWidth) /
    (itemWidth + columnGap)) : 1;
  const rowsCount = Math.ceil(itemsCount / itemsInRow);

  const {
    ref,
    scrollTop
  } = useScrollAware();

  const indexToOffset = useCallback((index: number, block: ScrollToBlock) => {
    const scrollToRow = index &&
      Math.floor(index / itemsInRow);
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
    const scrollTo = index && scrollToRow &&
      Math.ceil(scrollToRow * (itemHeight + rowGap)) -
        scrollOffset;
    return scrollTo;
  }, [
    rowGap,
    height,
    itemHeight,
    itemsInRow,
    scrollTop
  ]);

  const totalHeight = rowsCount * itemHeight +
    (rowsCount - 1) * rowGap;

  useImperativeHandle(scrollRef, () => ({
    scrollToIndex(index: number, block = 'center') {
      const scrollTo = indexToOffset(index, block);
      if (ref.current) {
        const div = ref.current;
        div.scroll(0, scrollTo);
      }
    }
  }), [
    indexToOffset,
    ref
  ]);

  useEffect(() => {
    if (ref.current) {
      if (scrollToIndex !== undefined) {
        const scrollTo = indexToOffset(scrollToIndex, 'center');
        const div = ref.current;
        div.scroll(0, scrollTo);
      }
    }
  }, [
    indexToOffset,
    ref,
    scrollToIndex
  ]);

  const startRow = Math.max(
    0,
    Math.floor(scrollTop / (itemHeight + rowGap)) - rowsAhead
  );
  const startItem = startRow * itemsInRow;

  const visibleItemsCount = Math.min(
    itemsCount - startItem,
    (Math.ceil(height / (itemHeight + rowGap)) + 2 * rowsAhead)
      * itemsInRow
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

  const visibleItems = useMemo(() =>
    (visibleItemsCount > 0) ?
      new Array(visibleItemsCount)
        .fill(null)
        .map((_ , index) => (
          <Item
            key={index + startItem}
            index={index + startItem}
          />
        )) :
      []
  ,[startItem, visibleItemsCount, Item]);

  const columnWidth = itemWidth ? `${itemWidth}px` : '1fr';
  const gridTemplateColumns = `repeat(${itemsInRow}, ${columnWidth})`;
  const rowWidth = itemWidth &&
    itemsInRow > 1 ?
      itemsInRow * itemWidth + (itemsInRow - 1) * columnGap :
      undefined;
  const totalWidth = (width && itemWidth && width < itemWidth) ?
    Math.max(width, itemWidth) : rowWidth;

  return (
    <div
      className={className}
      ref={ref}
      style={{
        height,
        width
      }}
    >
      <div
        className={'VirtualGrid-area'}
        style={{
          height: totalHeight,
          width: totalWidth
        }}
      >
        <div
          className={'VirtualGrid-visible'}
          style={{
            top: `${offsetY}px`,
            gap: `${rowGap}px ${columnGap}px`,
            gridTemplateColumns,
            ...(center && {
              justifyContent: 'center',
              justifyItems: 'center'
            })
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  );
});

export default VirtualGrid;
