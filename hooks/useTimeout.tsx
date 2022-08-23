import React, { useCallback, useEffect, useRef, useState } from "react";

const useTimeout = (callback, delay) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const [active, setActive] = useState(false);

  const set = useCallback(() => {
    setActive(true);
    timeoutRef.current = setTimeout(() => {
      setActive(false);
      callbackRef.current();
    }, delay);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setActive(false);
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [set, clear]);

  return { reset, clear, active };
};

export default useTimeout;
