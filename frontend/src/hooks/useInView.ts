'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to observe whether an element is visible in the viewport.
 * Returns a tuple containing [refCallback, inView, entry].
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [(node: T | null) => void, boolean, IntersectionObserverEntry | null] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = false } = options;
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const elementRef = useRef<T | null>(null);
  const frozenRef = useRef(false);

  const refCallback = useCallback((node: T | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;
    if (frozenRef.current) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        const isIntersecting = observerEntry.isIntersecting;
        setInView(isIntersecting);

        if (isIntersecting && triggerOnce) {
          frozenRef.current = true;
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [refCallback, inView, entry];
}
