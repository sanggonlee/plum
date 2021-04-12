import { useRef, MutableRefObject } from "react";
import { LocalStorageKey } from "types";
import { getLocalStorageItem, setLocalStorageItem } from "utils";

// export enum LocalStorageFixedKey {
//   Settings = "settings",
// }

// export type LocalStorageKey = LocalStorageFixedKey | string;

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

  const setItem = (val: any) => {
    setLocalStorageItem(key, val);
    cache.current = {
      ...cache.current,
      [key]: val,
    };
  };

  return [item, setItem];
}

// export default function useCachedLocalStorage(
//   key: LocalStorageKey,
//   useCache: boolean = true
// ): [any, Function] {
//   const cache: MutableRefObject<Cache> = useRef({});

//   let item = cache.current[key];
//   if (!item && useCache) {
//     try {
//       item = JSON.parse(localStorage.getItem(key) ?? "{}");
//       cache.current = {
//         ...cache.current,
//         [key]: item,
//       };
//     } catch (e) {
//       console.error(`Cannot parse local storage item: ${e}`);
//       item = {};
//     }
//   }

//   const setItem = (val: any) => {
//     localStorage.setItem(key, JSON.stringify(val));
//     cache.current = {
//       ...cache.current,
//       [key]: val,
//     };
//   };

//   return [item, setItem];
// }
