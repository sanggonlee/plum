import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { historicalBucketsState } from "state";
import { TablesBucket } from "types";

export default function useHistoricalBuckets(): [
  {
    getBucket: (startTime: string) => TablesBucket | undefined;
    getBucketStartTime: (time: number) => string | undefined;
  },
  {
    addToHistoricalBuckets: (bucket: TablesBucket) => void;
    garbageCollect: (timeframeStart: number) => void;
  }
] {
  const [historicalBuckets, setHistoricalBuckets]: [
    Record<string, TablesBucket>,
    Function
  ] = useRecoilState(historicalBucketsState);

  const _getBucket = useCallback(
    (startTime: string) => historicalBuckets[startTime],
    [historicalBuckets]
  );

  const _getBucketStartTime = useCallback(
    (time: number) => mapTimeToBucketStartTime(historicalBuckets, time),
    [historicalBuckets]
  );

  const _addToHistoricalBuckets = useCallback(
    (bucket: TablesBucket) => {
      const bucketKey = "" + new Date(bucket.t_start).getTime();
      setHistoricalBuckets(
        (historicalBuckets: Record<string, TablesBucket>) => ({
          ...historicalBuckets,
          [bucketKey]: bucket,
        })
      );
    },
    [setHistoricalBuckets]
  );

  const _garbageCollect = useCallback(
    (timeframeStart: number) => {
      const keyThreshold = "" + timeframeStart;
      setHistoricalBuckets(
        (prevHistoricalBuckets: Record<string, TablesBucket>) => {
          return Object.keys(prevHistoricalBuckets)
            .filter((key) => key >= keyThreshold)
            .reduce(
              (buckets: Record<string, TablesBucket>, time: string) => ({
                ...buckets,
                [time]: prevHistoricalBuckets[time],
              }),
              {}
            );
        }
      );
    },
    [setHistoricalBuckets]
  );

  return [
    {
      getBucket: _getBucket,
      getBucketStartTime: _getBucketStartTime,
    },
    {
      addToHistoricalBuckets: _addToHistoricalBuckets,
      garbageCollect: _garbageCollect,
    },
  ];
}

function mapTimeToBucketStartTime(
  historicalBuckets: Record<string, TablesBucket>,
  time: number
): string | undefined {
  const strTime = "" + time;
  const startTimes = Object.keys(historicalBuckets).sort();
  if (startTimes.length === 0 || strTime < startTimes[0]) {
    return undefined;
  }

  for (let i = 0; i < startTimes.length; ++i) {
    if (i + 1 === startTimes.length || strTime < startTimes[i + 1]) {
      return startTimes[i];
    }
  }

  return undefined;
}
