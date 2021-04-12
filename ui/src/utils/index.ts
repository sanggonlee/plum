import { LocalStorageKey } from "types";

export function getLocalStorageItem(key: LocalStorageKey) {
  return JSON.parse(localStorage.getItem(key) ?? "{}");
}

export function setLocalStorageItem(key: LocalStorageKey, val: any) {
  localStorage.setItem(key, JSON.stringify(val));
}
