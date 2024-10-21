import { useEffect, useRef, useState } from 'react';

export function useHasOverflowX<T extends HTMLElement = HTMLDivElement>() {
  const [hasOverflow, setHasOverflow] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const { scrollWidth, clientWidth } = element;
      setHasOverflow(scrollWidth > clientWidth);
    };

    checkOverflow();

    // Use ResizeObserver to detect changes in size of the element and its content
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref: elementRef, hasOverflow };
}
