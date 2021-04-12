import { useCallback, useMemo } from "react";
import { atom, useRecoilState } from "recoil";
import { RootBucket } from "monochron";
import { Process, Table, TablesBucket } from "api";
import { WebsocketSubscriptionType, registerWebsocketSource } from "api/ws";
import useHistoricalBuckets from "hooks/useHistoricalBuckets";
import useCachedLocalStorage from "hooks/useCachedLocalStorage";
import { LocalStorageFixedKey, TableSetting } from "types";

const bucketState = atom({
  key: "BUCKET",
  default: undefined,
});

export default function useTimeseriesSubscription(): [
  RootBucket | undefined,
  {
    subscribe: Function;
    unsubscribe: Function;
  }
] {
  const [newBucket, setNewBucket]: [
    RootBucket | undefined,
    Function
  ] = useRecoilState(bucketState);

  const [, { addToHistoricalBuckets }] = useHistoricalBuckets();
  const [settings] = useCachedLocalStorage(LocalStorageFixedKey.Settings);

  const wsSource = useMemo(
    () =>
      registerWebsocketSource(
        WebsocketSubscriptionType.Tables,
        {
          interval: settings.timeseriesInterval,
          relations: settings.tables
            .filter((table: TableSetting) => table.isOn)
            .map((table: TableSetting) => table.relname),
        },
        (bucket: TablesBucket) => {
          if (bucket === undefined) {
            return;
          }

          addToHistoricalBuckets(bucket);
          setNewBucket(tablesBucketToMonochronBucket(bucket));
        }
      ),
    [addToHistoricalBuckets, setNewBucket, settings]
  );

  const subscribe = useCallback(() => wsSource.subscribe(), [wsSource]);
  const unsubscribe = useCallback(() => wsSource.unsubscribe(), [wsSource]);

  return [
    newBucket,
    {
      subscribe,
      unsubscribe,
    },
  ];
}

function tablesBucketToMonochronBucket(bucket: TablesBucket): RootBucket {
  return {
    t_start: bucket.t_start,
    t_end: bucket.t_end,
    entries: bucket.table_states.map((table: Table) => ({
      key: table.relname,
      start: 0,
      end: 0,
      data: table,
      buckets: table.processes.map((process: Process) => ({
        key: "" + process.pid,
        start: 0,
        end: 0,
        data: process,
        buckets: [],
      })),
    })),
  };
}
