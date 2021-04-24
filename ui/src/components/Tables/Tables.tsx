import { memo, MouseEvent, useCallback, useEffect } from "react";
import { Bucket, TimeseriesChart } from "monochron";
import SubscriptionControl from "components/SubscriptionControl";
import useHistoricalBuckets from "hooks/useHistoricalBuckets";
import useTimeseriesSubscription from "hooks/useTimeseriesSubscription";
import { Process, SubscriptionType, Table } from "types";
import { setLocalStorageItem } from "utils";

const defaultFrameCycle = 60 * 1000; // 1 minute
const defaultRulerInterval = 5 * 1000; // 5 seconds

interface TablesProps {
  subscriptionType?: SubscriptionType;
  frameCycle?: number;
  rulerInterval?: number;
}

function Tables({
  subscriptionType = SubscriptionType.MONITOR,
  frameCycle = defaultFrameCycle,
  rulerInterval = defaultRulerInterval,
}: TablesProps) {
  const [newBucket, { unsubscribe }] = useTimeseriesSubscription(
    SubscriptionType.MONITOR
  );
  const [
    { getBucket, getBucketStartTime },
    { garbageCollect },
  ] = useHistoricalBuckets();

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
      window.open(`/tables/snapshot?time=${bucketTimeKey}`, "_blank");
    },
    [getBucketStartTime, getBucket]
  );

  const _onTimeframeChange = useCallback(
    (newTimeframeStart) => {
      garbageCollect(newTimeframeStart);
    },
    [garbageCollect]
  );

  return (
    <SubscriptionControl type={subscriptionType}>
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
    </SubscriptionControl>
  );
}

export default memo(Tables);
