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

const useScrollAware = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const signal = useAbortSignal();

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer) {
      return;
    }

    const onScroll = (e: Event) => {
      const div = e.target as HTMLDivElement;
      if (div && !signal.aborted) {
        setScrollTop(+div.scrollTop);
      }
    };

    setScrollTop(scrollContainer.scrollTop);
    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [
    signal
  ]);

  return {
    scrollTop,
    ref
  };
};

interface RectSize {
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
  useScrollAware,
  useRectSize
}
