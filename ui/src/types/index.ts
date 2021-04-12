export * from "./setting";
export * from "./storage";
export * from "./ws";

export interface TopBucket {
  t_start: string;
  t_end: string;
  entries: Bucket[];
}

export interface Bucket {
  key: string;
  start: number;
  end: number;
  data: unknown;
  buckets: Bucket[];
}
