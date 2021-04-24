import { useCallback, useRef, MutableRefObject } from "react";
import { LocalStorageKey } from "types";
import { getLocalStorageItem, setLocalStorageItem } from "utils";

export type Cache = {
  [key in LocalStorageKey]?: Object;
};

export default function useCachedLocalStorage(
  key: LocalStorageKey
): [any, Function] {
  const cache: MutableRefObject<Cache> = useRef({});

  let item = cache.current[key];
  if (!item) {
    try {
      item = getLocalStorageItem(key);
      cache.current = {
        ...cache.current,
        [key]: item,
      };
    } catch (e) {
      console.warn(`Cannot parse local storage item: ${e}`);
      item = {};
    }
  }

  const setItem = useCallback(
    (val: any) => {
      setLocalStorageItem(key, val);
      cache.current = {
        ...cache.current,
        [key]: val,
      };
    },
    [key]
  );

  return [item, setItem];
}
