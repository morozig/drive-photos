import {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { useAbortSignal } from '../../../../lib/hooks';

const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      const timeout = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(timeout);
      };
    },
    [value, delay]
  );

  return debouncedValue;
};

const useScroll = (ref: React.RefObject<HTMLDivElement>) => {
  const [scrollTop, setScrollTop] = useState(0);
  // const debouncedScrollTop = useDebounce(scrollTop, 15);
  const signal = useAbortSignal();
  const [ isScrolling, setScrolling ] = useState(false);
  const isScrollingHandlerRef = useRef<NodeJS.Timeout>();

  const setIsScrolling = useCallback(() => {
    if (isScrollingHandlerRef.current) {
      clearTimeout(isScrollingHandlerRef.current);
    }
    setScrolling(true);
    isScrollingHandlerRef.current = setTimeout(() => {
      if (!signal.aborted) {
        setScrolling(false);
      }
    }, 300)
  }, [
    signal
  ]);

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer) {
      return;
    }

    const onScroll = (e: Event) => {
      const div = e.target as HTMLDivElement;
      if (div) {
        setScrollTop(+div.scrollTop);
        setIsScrolling();
      }
    };

    setScrollTop(scrollContainer.scrollTop);
    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [
    ref,
    setIsScrolling
  ]);

  
  return {
    scrollTop,
    isScrolling
  };
  // return debouncedScrollTop;
};

export interface RectSize {
  width: number;
  height: number;
}

const useRectSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [ rectSize, setRectSize ] = useState({
    width: 0,
    height: 0
  } as RectSize);
  const debouncedRectSize = useDebounce(rectSize, 150);
  const signal = useAbortSignal();

  const check = useCallback(async () => {
    requestAnimationFrame(() => {
      const div = ref.current;
      if (div && !signal.aborted) {
        setRectSize({
          width: div.offsetWidth,
          height: div.offsetHeight
        } as RectSize)
      }
    });
  }, [
    signal
  ]);

  useEffect(() => {
    check();
    window.addEventListener('resize', check);

    return () => {
      window.removeEventListener('resize', check);
    };
  }, [
    check,
    signal
  ]);


  return {
    ref,
    rectSize: debouncedRectSize
  };
};

export {
  useDebounce,
  useScroll,
  useRectSize
}
