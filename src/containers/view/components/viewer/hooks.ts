import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo
} from 'react';
import { useAbortSignal } from '../../../../lib/hooks';

interface ScrollActionsOptions {
  wheelCount?: number;
  onScrollOverTop?: () => void;
  onScrollBelowBottom?: () => void;
};

const useScrollActions = (options: ScrollActionsOptions) => {
  const {
    wheelCount = 3,
    onScrollOverTop,
    onScrollBelowBottom
  } = options;
  const ref = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const scrollOverTopCountRef = useRef(0);
  const scrollBelowBottomCountRef = useRef(0);

  const scrollToTop = useCallback(() => {
    if (ref.current) {
      const div = ref.current;
      div.scroll(0, 0);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      const div = ref.current;
      div.scroll(0, div.scrollHeight);
    }
  }, []);

  const scrollNextSlide = useCallback(() => {
    if (ref.current) {
      const div = ref.current;
      const scrollHeight = div.scrollHeight - div.offsetHeight;
      if (scrollTopRef.current >= scrollHeight && onScrollBelowBottom) {
        onScrollBelowBottom();
      } else {
        const slideSize = Math.max(div.offsetHeight - 50, 50);
        div.scroll(0, scrollTopRef.current + slideSize);
      }
    }
  }, [
    onScrollBelowBottom
  ]);

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer) {
      return;
    }

    const onScroll = (e: Event) => {
      requestAnimationFrame(() => {
        const div = e.target as HTMLDivElement;
        if (div) {
          scrollTopRef.current = +div.scrollTop;
        }
      });
    };

    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [
  ]);

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      const div = ref.current;
      if (e.shiftKey || e.ctrlKey) {
        return;
      }
      if (div) {
        const scrollHeight = div.scrollHeight - div.offsetHeight;
        if (e.deltaY < 0) {
          scrollBelowBottomCountRef.current = 0;
          if (scrollTopRef.current <= 0) {
            scrollOverTopCountRef.current += 1;
          }
          if (onScrollOverTop) {
            if (
              scrollHeight <= 0 ||
              scrollOverTopCountRef.current >= wheelCount
            ) {
              scrollOverTopCountRef.current = 0;
              onScrollOverTop();
            }
          }
        }
        if (e.deltaY > 0) {
          scrollOverTopCountRef.current = 0;
          if (scrollTopRef.current >= scrollHeight) {
            scrollBelowBottomCountRef.current += 1;
          }
          if (onScrollBelowBottom) {
            if (
              scrollHeight <= 0 ||
              scrollBelowBottomCountRef.current >= wheelCount
            ) {
              scrollBelowBottomCountRef.current = 0;
              onScrollBelowBottom();
            }
          }
        }
      }
    };

    scrollContainer.addEventListener('wheel', onWheel);
    return () => scrollContainer.removeEventListener('wheel', onWheel);
  }, [
    wheelCount,
    onScrollOverTop,
    onScrollBelowBottom
  ]);

  return {
    ref,
    scrollToTop,
    scrollToBottom,
    scrollNextSlide
  };
};

const useDelayedId = (file?: gapi.client.drive.File) => {
  const [ delayedId, setDelayedId ] = useState('');
  const signal = useAbortSignal();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const delayedId = (file && file.id) ? file.id: '';
      if (!signal.aborted) {
        setDelayedId(delayedId);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [
    file,
    signal.aborted
  ]);
  return delayedId;
};

const zoomScale = 5;
const useZoom = () => {
  const [ sliderValue, setSliderValue ] = useState(0);
  const signal = useAbortSignal();

  const sliderScale = useCallback((sliderValue: number) => {
    return Math.round(100 * zoomScale ** sliderValue)
  }, []);

  const onSliderChange = useCallback((event: Event, value: number | number[]) => {
    requestAnimationFrame(() => {
      if (!Array.isArray(value) && !signal.aborted) {
        setSliderValue(value);
      }
    });
  }, [
    signal.aborted
  ]);
  const onZoomMinus = useCallback(() => {
    setSliderValue(current => Math.max(-1, current - 1 / zoomScale));
  }, []);
  const onZoomPlus = useCallback(() => {
    setSliderValue(current => Math.min(1, current + 1 / zoomScale));
  }, []);
  const zoom = useMemo(() => {
    return sliderScale(sliderValue);
  }, [
    sliderValue,
    sliderScale
  ]);

  return {
    sliderValue,
    sliderScale,
    onSliderChange,
    onZoomMinus,
    onZoomPlus,
    zoom
  };
};

const swipeThreshold = 60;
const androidMagicOffset = 5;

interface SwipeActionsOptions {
  ref?: React.RefObject<HTMLDivElement>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

const useSwipeActions = (options: SwipeActionsOptions) => {
  const {
    ref,
    onSwipeLeft,
    onSwipeRight
  } = options;
  const touchRef = useRef<Touch | undefined>();
  const scrollLeftRef = useRef<number | undefined>();
  const scrollWidthRef = useRef<number | undefined>();

  useEffect(() => {
    const scrollContainer = ref?.current;
    if (!scrollContainer) {
      return;
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && !touchRef.current) {
        touchRef.current = e.touches[0];
        scrollLeftRef.current = scrollContainer.scrollLeft;
        scrollWidthRef.current = scrollContainer.scrollWidth - scrollContainer.offsetWidth;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (
        e.changedTouches.length === 1 &&
        touchRef.current &&
        touchRef.current.identifier === e.changedTouches[0].identifier &&
        scrollLeftRef.current !== undefined &&
        scrollWidthRef.current !== undefined
      ) {
        const deltaX = e.changedTouches[0].clientX - touchRef.current.clientX;
        const deltaY = e.changedTouches[0].clientY - touchRef.current.clientY;
        const scrollLeft = scrollLeftRef.current;
        const scrollWidth = scrollWidthRef.current;
        touchRef.current = undefined;
        scrollLeftRef.current = undefined;
        scrollWidthRef.current = undefined;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (
            deltaX < -swipeThreshold &&
            scrollLeft >= scrollWidth - androidMagicOffset &&
            onSwipeLeft
          ) {
            onSwipeLeft();
          }
          if (
            deltaX > swipeThreshold &&
            scrollLeft <= 0 &&
            onSwipeRight
          ) {
            onSwipeRight();
          }
        }
      } else {
        touchRef.current = undefined;
      }
    };

    scrollContainer.addEventListener('touchstart', onTouchStart);
    scrollContainer.addEventListener('touchend', onTouchEnd);
    return () => {
      scrollContainer.removeEventListener('touchstart', onTouchStart);
      scrollContainer.removeEventListener('touchend', onTouchEnd);
    };
  }, [
    ref,
    onSwipeLeft,
    onSwipeRight
  ]);
};

export {
  useScrollActions,
  useDelayedId,
  useZoom,
  useSwipeActions
}
