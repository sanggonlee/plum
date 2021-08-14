import { atom } from "recoil";

export const bucketState = atom({
  key: "BUCKET",
  default: undefined,
});

export const historicalBucketsState = atom({
  key: "HISTORICAL_BUCKETS",
  default: {},
});

export const timeseriesStartState = atom({
  key: "TIMESERIES_START",
  default: 0,
});

export const numLocksState = atom<number[]>({
  key: "NUM_LOCKS",
  default: [],
});
