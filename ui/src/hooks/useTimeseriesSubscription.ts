import { useCallback, useMemo } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { RootBucket } from "monochron";
import { WebsocketSubscriptionType, registerWebsocketSource } from "api/ws";
import useCachedLocalStorage from "hooks/useCachedLocalStorage";
import useHistoricalBuckets from "hooks/useHistoricalBuckets";
import useTimeseriesPersistence from "hooks/useTimeseriesPersistence";
import { bucketState, timeseriesStartState } from "state";
import {
  Process,
  Table,
  TablesBucket,
  LocalStorageFixedKey,
  SubscriptionType,
  TableSetting,
} from "types";
import { formatTimeseriesFilename } from "utils";

export default function useTimeseriesSubscription(
  type: SubscriptionType
): [
  RootBucket | undefined,
  {
    subscribeMonitor: Function;
    subscribeReplay: Function;
    unsubscribe: Function;
  }
] {
  const [newBucket, setNewBucket]: [
    RootBucket | undefined,
    Function
  ] = useRecoilState(bucketState);
  const [setTimeseriesStart] = useTimeseriesPersistence();
  const [, { addToHistoricalBuckets }] = useHistoricalBuckets();
  const [settings] = useCachedLocalStorage(LocalStorageFixedKey.Settings);

  const _handleTablesBucket = useCallback(
    (bucket: TablesBucket) => {
      if (bucket === undefined) {
        return;
      }

      addToHistoricalBuckets(bucket);
      setNewBucket(tablesBucketToMonochronBucket(bucket));
    },
    [addToHistoricalBuckets, setNewBucket]
  );

  const tablesMonitorSubscription = useMemo(
    () =>
      registerWebsocketSource(
        WebsocketSubscriptionType.TablesMonitor,
        _handleTablesBucket
      ),
    [_handleTablesBucket]
  );

  const tablesReplaySubscription = useMemo(
    () =>
      registerWebsocketSource(
        WebsocketSubscriptionType.TablesReplay,
        _handleTablesBucket
      ),
    [_handleTablesBucket]
  );

  const wsSource = useMemo(
    () =>
      type === SubscriptionType.MONITOR
        ? tablesMonitorSubscription
        : tablesReplaySubscription,
    [type, tablesMonitorSubscription, tablesReplaySubscription]
  );

  const subscribeMonitor = useCallback(() => {
    wsSource.subscribe({
      interval: settings.timeseriesInterval,
      relations: settings.tables
        .filter((table: TableSetting) => table.isOn)
        .map((table: TableSetting) => table.relname),
      save_as: setTimeseriesStart(),
    });
  }, [wsSource, setTimeseriesStart, settings]);

  const subscribeReplay = useCallback(
    (fileId) => {
      wsSource.subscribe({
        interval: settings.timeseriesInterval,
        file_id: fileId,
      });
    },
    [wsSource, settings]
  );

  const unsubscribe = useCallback(() => {
    wsSource.unsubscribe();
    setNewBucket(undefined);
  }, [wsSource, setNewBucket]);

  return [
    newBucket,
    {
      subscribeMonitor,
      subscribeReplay,
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
