import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { getTimeseriesDownloadFileUrl } from "api/http";
import useCachedLocalStorage from "hooks/useCachedLocalStorage";
import { timeseriesStartState } from "state";
import { LocalStorageFixedKey } from "types";
import { formatTimeseriesFilename } from "utils";

export default function useTimeseriesPersistence(): [Function, Function] {
  const [storedSettings] = useCachedLocalStorage(LocalStorageFixedKey.Settings);
  const [timeseriesStart, setTimeseriesStart]: [
    number,
    Function
  ] = useRecoilState(timeseriesStartState);

  const _download = useCallback(() => {
    if (!storedSettings.saveToFile) {
      return;
    }

    const filename = formatTimeseriesFilename(timeseriesStart);

    const link = document.createElement("a");
    link.download = "";
    link.href = getTimeseriesDownloadFileUrl(filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [timeseriesStart, storedSettings]);

  const _setTimeseriesFilename = useCallback(() => {
    if (!storedSettings.saveToFile) {
      return undefined;
    }

    const startTime = new Date().getTime();
    setTimeseriesStart(startTime);
    return formatTimeseriesFilename(startTime);
  }, [storedSettings, setTimeseriesStart]);

  return [_setTimeseriesFilename, _download];
}
