import { useCallback, useEffect, useRef, type RefObject } from 'react';

export interface PendingFocus<T extends string> {
  /** Attach to the element that contains every focus target. */
  readonly rootRef: RefObject<HTMLDivElement | null>;
  /** Asks for focus on the element marked `data-focus="<target>"`. */
  readonly requestFocus: (target: T) => void;
}

/**
 * Moves focus to a control that a state change is about to render. A request
 * stays pending until its target exists, because a render that was already
 * queued can run the effect before the render that the request caused.
 */
export function usePendingFocus<T extends string>(): PendingFocus<T> {
  const rootRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const pending: RefObject<T | null> = useRef<T | null>(null);

  // Runs after every render: the target can appear in any of them.
  useEffect((): void => {
    const target: T | null = pending.current;
    if (target === null || rootRef.current === null) {
      return;
    }
    for (const element of rootRef.current.querySelectorAll<HTMLElement>(
      '[data-focus]',
    )) {
      if (element.dataset['focus'] === target) {
        pending.current = null;
        element.focus();
        return;
      }
    }
  });

  const requestFocus: (target: T) => void = useCallback((target: T): void => {
    pending.current = target;
  }, []);

  return { rootRef, requestFocus };
}
