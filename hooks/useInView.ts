import { useEffect, useRef, useCallback } from "react";

/**
 * Fires `onIntersect` whenever the returned ref's element enters the viewport.
 * Use this to trigger the next page load in an infinite-scroll feed.
 */
export function useInView(
  onIntersect: () => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onIntersect);

  // Keep the callback ref up-to-date without re-subscribing the observer
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callbackRef.current();
        }
      },
      { rootMargin: "200px", threshold: 0, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
