import { memo } from "react";
import { useRecoilState } from "recoil";
import { numLocksState } from "state";

interface NumLocksChartOptions {
  timeseriesInterval?: number;
  frameCycle?: number;
}

interface NumLocksChartProps {
  containerClass?: string;
  options: NumLocksChartOptions;
}

const defaultFrameCycle = 60_000; // 1 minute
const defaultTimeseriesInterval = 1000;

const totalHeight = 100;

function NumLocksChart({
  containerClass = "",
  options = {},
}: NumLocksChartProps) {
  const {
    timeseriesInterval = defaultTimeseriesInterval,
    frameCycle = defaultFrameCycle,
  } = options;

  const [numLocksData = []] = useRecoilState(numLocksState);
  const barWidth = 100 / (frameCycle / timeseriesInterval);
  const maxNumLocks = Math.max(...numLocksData);
  const heightUnit = totalHeight / maxNumLocks;

  return (
    <div
      className={`relative flex items-end ${containerClass}`}
      style={{ height: totalHeight }}
    >
      <span className="relative w-px h-full bg-transparent">
        <span className="absolute right-full -top-4">{maxNumLocks}</span>
        <span className="absolute right-full -bottom-4">0</span>
      </span>
      {numLocksData.map((numLocks, index) => (
        <span
          key={index}
          className="bg-blue-400"
          style={{
            width: `${barWidth}%`,
            height: numLocks * heightUnit,
          }}
        ></span>
      ))}
    </div>
  );
}

export default memo(NumLocksChart);
