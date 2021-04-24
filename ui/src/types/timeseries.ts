export type TimeseriesMonitorAPIOptions = {
  interval?: number;
  relations?: string[];
  save_as?: string;
};

export type TimeseriesReplayAPIOptions = {
  interval?: number;
  file_id?: string;
};

export type TimeseriesAPIOptions =
  | TimeseriesMonitorAPIOptions
  | TimeseriesReplayAPIOptions;

export enum SubscriptionType {
  MONITOR = "MONITOR",
  REPLAY = "REPLAY",
}
