import {
  useState,
  useEffect,
} from 'react';
import { useAbortSignal } from '../../../../lib/hooks';

const useScrollAware = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const signal = useAbortSignal();

  useEffect(() => {
    const onScroll = () => {
      if (!signal.aborted) {
        setScrollTop(+document.documentElement.scrollTop);
      }
    };

    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [
    signal
  ]);

  return scrollTop;
};

export {
  useScrollAware,
}
