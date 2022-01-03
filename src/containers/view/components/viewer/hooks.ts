import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo
} from 'react';
import { useAbortSignal } from '../../../../lib/hooks';

interface ScrollActionsOptions {
  isDisabled?: boolean;
  wheelCount?: number;
  onScrollOverTop?: () => void;
  onScrollBelowBottom?: () => void;
  isOverflow?: boolean;
};

const useScrollActions = (options: ScrollActionsOptions) => {
  const {
    isDisabled,
    wheelCount = 3,
    onScrollOverTop,
    onScrollBelowBottom,
    isOverflow,
  } = options;
  const ref = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const scrollOverTopCountRef = useRef(0);
  const scrollBelowBottomCountRef = useRef(0);

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
      if (!isDisabled) {
        requestAnimationFrame(() => {
          const div = e.target as HTMLDivElement;
          if (div) {
            scrollTopRef.current = +div.scrollTop;
          }
        });
      }
    };

    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [
    isDisabled
  ]);

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer || isDisabled) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      const div = ref.current;
      if (isOverflow || e.shiftKey || e.ctrlKey) {
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
    isDisabled,
    wheelCount,
    onScrollOverTop,
    onScrollBelowBottom,
    isOverflow,
  ]);

  return {
    ref,
    scrollNextSlide
  };
};

export type ZoomSetter = (current: number) => number;
const zoomScale = 5;
const sliderScale = (sliderValue: number) => 
  Math.round(100 * zoomScale ** sliderValue);
const zoomToValue = (zoom: number) =>
  Math.log(zoom / 100) / Math.log(zoomScale);

const useZoom = () => {
  const [ sliderValue, setSliderValue ] = useState(0);
  const signal = useAbortSignal();

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
  ]);
  const setZoom = useCallback((setter: ZoomSetter) => {
    setSliderValue(currentValue => {
      const currentZoom = sliderScale(currentValue);
      const newZoom = setter(currentZoom);
      const newValue = zoomToValue(newZoom);
      return newValue > currentValue ?
        Math.min(1, newValue) :
        Math.max(-1, newValue);
    });
  }, []);

  return {
    sliderValue,
    sliderScale,
    onSliderChange,
    onZoomMinus,
    onZoomPlus,
    zoom,
    setZoom,
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

interface TouchScrollOptions {
  width: number;
  gap: number;
  ref: React.RefObject<HTMLDivElement>;
  activeIndex: number;
  contentHash?: string;
  isEnabled?: boolean;
  onPrevImage?: () => void;
  onNextImage?: () => void;
};

const useTouchScroll = (options: TouchScrollOptions) => {
  const {
    width,
    gap,
    ref,
    activeIndex,
    contentHash,
    isEnabled,
    onPrevImage,
    onNextImage,
  } = options;

  useEffect(() => {
    if (isEnabled && width &&
      ref.current
    ) {
      const scrollContainer = ref.current;
      scrollContainer.scrollLeft = (width + 20) * activeIndex;
    }
  }, [
    isEnabled,
    width,
    ref,
    activeIndex,
    contentHash
  ]);

  const isSwipeLockedRef = useRef(false);

  useEffect(() => {
    const onScroll = (e: Event) => {
      const div = e.target as HTMLDivElement;
      if (div) {
        if (!isSwipeLockedRef.current) {
          const current = div.scrollLeft / (width + gap);
          if (Math.ceil(current) < activeIndex && onPrevImage) {
            isSwipeLockedRef.current = true;
            onPrevImage();
          }
          if (Math.floor(current) > activeIndex && onNextImage) {
            isSwipeLockedRef.current = true;
            onNextImage();
          }
        } else {
          isSwipeLockedRef.current = false;
        }
      }
    };

    if (isEnabled && width &&
      ref.current
    ) {
      const scrollContainer = ref.current;
      scrollContainer.addEventListener('scroll', onScroll);
      return () => scrollContainer.removeEventListener('scroll', onScroll);
    }
  }, [
    isEnabled,
    width,
    gap,
    ref,
    activeIndex,
    onPrevImage,
    onNextImage,
    contentHash,
  ]);
};

export {
  useScrollActions,
  useZoom,
  useSwipeActions,
  useTouchScroll
}
