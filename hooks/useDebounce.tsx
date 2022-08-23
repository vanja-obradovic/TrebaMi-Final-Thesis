import React, { useEffect } from "react";
import useTimeout from "./useTimeout";

const useDebounce = (callback, delay, deps) => {
  const { reset, clear, active } = useTimeout(callback, delay);

  useEffect(reset, [...deps, reset]);
  useEffect(clear, []);

  return active;
};

export default useDebounce;
