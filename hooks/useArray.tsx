import React, { useState } from "react";

function useArray<S>(defaultValue: Array<S>) {
  const [array, setArray] = useState(defaultValue);

  const push = (element: S) => {
    setArray((a) => [...a, element]);
    return element;
  };

  const filter = (callback) => {
    setArray((a) => a.filter(callback));
  };

  const insert = (index, newElement) => {
    setArray((a) => [...a.slice(0, index), newElement, ...a.slice(index + 1)]);
  };

  const remove = (index) => {
    setArray((a) => [...a.slice(0, index), ...a.slice(index + 1)]);
  };

  const removeElement = (element) => {
    setArray((a) =>
      a.flatMap((el) => {
        if (el === element) return [];
        else return el;
      })
    );
  };

  const removePrimitiveDuplicates = (a) => {
    const seen = {};
    return a.filter((item) => {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  };

  const clear = () => {
    setArray([]);
  };

  return {
    array: array,
    set: setArray,
    push,
    filter,
    insert,
    remove,
    removeElement,
    removePrimitiveDuplicates,
    clear,
  };
}

export default useArray;
