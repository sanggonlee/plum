import { memo, MouseEvent, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { Bucket, TimeseriesChart } from "monochron";
import NumLocksChart from "components/NumLocksChart";
import SubscriptionControl from "components/SubscriptionControl";
import useCachedLocalStorage from "hooks/useCachedLocalStorage";
import useHistoricalBuckets from "hooks/useHistoricalBuckets";
import useTimeseriesSubscription from "hooks/useTimeseriesSubscription";
import { numLocksState } from "state";
import { LocalStorageFixedKey, Process, SubscriptionType, Table } from "types";
import { setLocalStorageItem } from "utils";

const defaultFrameCycle = 60_000; // 1 minute
const defaultRulerInterval = 10_000; // 10 seconds

interface TablesProps {
  subscriptionType?: SubscriptionType;
  rulerInterval?: number;
}

function Tables({
  subscriptionType = SubscriptionType.MONITOR,
  rulerInterval = defaultRulerInterval,
}: TablesProps) {
  const [newBucket, { unsubscribe }] = useTimeseriesSubscription(
    SubscriptionType.MONITOR
  );
  const [, setNumLocks] = useRecoilState(numLocksState);
  const [{ getBucket, getBucketStartTime }, { garbageCollect }] =
    useHistoricalBuckets();
  const [settings] = useCachedLocalStorage(LocalStorageFixedKey.Settings);
  const frameCycle = settings.frameCycle ?? defaultFrameCycle;
  const timeseriesInterval = settings.timeseriesInterval;

  useEffect(() => {
    return () => {
      unsubscribe();
      garbageCollect(0);
    };
  }, [unsubscribe, garbageCollect]);

  const _onChartClick = useCallback(
    (evt: MouseEvent, mappedTime: number) => {
      const bucketTimeKey = getBucketStartTime(mappedTime);
      if (!bucketTimeKey) {
        console.error(
          `Time entry ${mappedTime} got out of sync with the stored buckets`
        );
        return;
      }
      const bucket = getBucket(bucketTimeKey);
      setLocalStorageItem(`historicalBucket::${bucketTimeKey}`, bucket);
      window.open(`/monitor/snapshot?time=${bucketTimeKey}`, "_blank");
    },
    [getBucketStartTime, getBucket]
  );

  const _onTimeframeChange = useCallback(
    (newTimeframeStart) => {
      garbageCollect(newTimeframeStart);
      setNumLocks((numLocks) => {
        const threshold = Math.ceil(numLocks.length / 2);
        return [...numLocks.slice(threshold)];
      });
    },
    [garbageCollect, setNumLocks]
  );

  return (
    <SubscriptionControl type={subscriptionType}>
      <>
        <NumLocksChart
          containerClass="mx-10"
          options={{
            frameCycle,
            timeseriesInterval,
          }}
        />
        <TimeseriesChart
          width="100%"
          containerClass="flex-1"
          options={{
            frameCycle,
            rulerInterval,
          }}
          newBucket={newBucket}
          onClick={_onChartClick}
          onTimeframeChange={_onTimeframeChange}
          renderRow={(tableBucket: Bucket, Row: any) => {
            const table = tableBucket.data as Table;
            return (
              <Row
                key={tableBucket.key}
                start={tableBucket.start}
                end={tableBucket.end}
                containerClassName="my-1 py-2 shadow-sm"
              >
                {table.relname}
                {(tableBucket.buckets ?? []).map(
                  (processBucket: Bucket, pIndex: number) => {
                    const process = processBucket.data as Process;
                    return (
                      <Row
                        key={pIndex}
                        start={processBucket.start}
                        end={processBucket.end}
                        containerClassName="mx-0 my-0.5 py-1 bg-blue-200 whitespace-nowrap"
                      >
                        <p>PID:{process.pid}</p>
                      </Row>
                    );
                  }
                )}
              </Row>
            );
          }}
        />
      </>
    </SubscriptionControl>
  );
}

export default memo(Tables);
