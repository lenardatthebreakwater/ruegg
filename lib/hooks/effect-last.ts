"use client";

import { useEffect, useRef } from "react";

type Cleanup = void | (() => void);

export function useMountEffect(effect: () => Cleanup) {
  // Intentional mount-only wrapper used by project convention.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}

export function useValueChangeEffect<T>(
  value: T,
  effect: (value: T, previousValue: T | undefined) => Cleanup
) {
  const isFirstRunRef = useRef(true);
  const previousValueRef = useRef<T | undefined>(undefined);
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      previousValueRef.current = value;
      return;
    }

    const cleanup = effectRef.current(value, previousValueRef.current);
    previousValueRef.current = value;
    return cleanup;
  }, [value]);
}

export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document | null,
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!target) return;

    const listener: EventListener = (event) => {
      handlerRef.current(event as DocumentEventMap[K]);
    };

    target.addEventListener(eventName, listener, options);
    return () => target.removeEventListener(eventName, listener, options);
  }, [eventName, options, target]);
}
