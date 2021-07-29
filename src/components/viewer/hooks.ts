import {
  useEffect,
  useRef,
  useCallback
} from 'react';

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
    scrollToBottom
  };
};

export {
  useScrollActions
}
