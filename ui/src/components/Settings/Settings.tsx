import { ChangeEvent, useCallback, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { getTables } from "api";
import Button from "components/Button";
import Checkbox from "components/Checkbox";
import useCachedLocalStorage from "hooks/useCachedLocalStorage";
import { LocalStorageFixedKey, TableSetting } from "types";

const defaultTimeseriesInterval = 1000;

export default function Settings() {
  const { addToast } = useToasts();
  const [storedSettings, storeSettings] = useCachedLocalStorage(
    LocalStorageFixedKey.Settings
  );
  const [timeseriesInterval, setTimeseriesInterval] = useState(
    storedSettings.timeseriesInterval ?? defaultTimeseriesInterval
  );
  const [tableSettings, setTableSettings]: [
    TableSetting[],
    Function
  ] = useState(storedSettings.tables);

  const _onTimeSeriesIntervalChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setTimeseriesInterval(+evt.target.value);
    },
    [setTimeseriesInterval]
  );

  const _onTableSettingChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>, index: number) => {
      setTableSettings((tableSettings: TableSetting[]) => [
        ...tableSettings.slice(0, index),
        {
          ...tableSettings[index],
          isOn: evt.target.checked,
        },
        ...tableSettings.slice(index + 1),
      ]);
    },
    [setTableSettings]
  );

  const _onSave = useCallback(() => {
    storeSettings({
      timeseriesInterval,
      tables: tableSettings,
    });
    addToast("Settings saved.", {
      appearance: "success",
      autoDismiss: true,
    });
  }, [timeseriesInterval, tableSettings, storeSettings, addToast]);

  if (!tableSettings) {
    getTables().then((tablesData) => {
      const _tableSettings: TableSetting[] = tablesData.map((table) => ({
        relid: table.relid,
        relname: table.relname,
        isOn: true,
      }));
      storeSettings((settings: any) => ({
        ...settings,
        tables: _tableSettings,
      }));
      setTableSettings(_tableSettings);
    });

    return null;
  }

  return (
    <div className="flex flex-col p-10 w-full">
      <div className="flex flex-row justify-end items-end my-5">
        <Button containerClassName="bg-gray-200" onClick={_onSave}>
          Save
        </Button>
      </div>
      <div className="flex flex-col items-start my-5">
        <div className="my-3 font-bold">Timeseries Interval (milliseconds)</div>
        <div>
          <input
            className="border rounded-md p-3"
            value={timeseriesInterval}
            onChange={_onTimeSeriesIntervalChange}
          />
        </div>
      </div>
      <div className="flex flex-col items-start">
        <div className="my-3 font-bold">Subscribed Tables</div>
        <div className="w-full">
          {tableSettings.map((tableSetting: TableSetting, index: number) => (
            <Checkbox
              key={index}
              label={tableSetting.relname}
              isChecked={tableSetting.isOn}
              onChange={(evt) => _onTableSettingChange(evt, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
