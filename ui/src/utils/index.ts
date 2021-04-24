import { LocalStorageKey, TimeseriesAPIOptions } from "types";

export function getLocalStorageItem(key: LocalStorageKey) {
  return JSON.parse(localStorage.getItem(key) ?? "{}");
}

export function setLocalStorageItem(key: LocalStorageKey, val: any) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function optionsToQueryParams(options: TimeseriesAPIOptions): string {
  const opts = options as any;
  return Object.keys(opts)
    .filter((key) => !!opts[key])
    .map((key) => {
      let val = opts[key];
      if (Array.isArray(val)) {
        val = val.join(",");
      }
      return `${key}=${val}`;
    })
    .join("&");
}

export function formatTimeseriesFilename(startTime: number): string {
  return `plum_${startTime}`;
}
