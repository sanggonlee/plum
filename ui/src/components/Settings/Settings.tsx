import { ChangeEvent, memo, useCallback, useMemo, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { getTables } from "api/http";
import Button from "components/Button";
import Checkbox from "components/Checkbox";
import RadioGroup from "components/RadioGroup";
import useCachedLocalStorage from "hooks/useCachedLocalStorage";
import { LocalStorageFixedKey, TableSetting } from "types";

const defaultTimeseriesInterval = 1000;
const defaultFrameCycle = 60_000;

function Settings() {
  const { addToast } = useToasts();
  const [storedSettings, storeSettings] = useCachedLocalStorage(
    LocalStorageFixedKey.Settings
  );
  const [timeseriesInterval, setTimeseriesInterval] = useState(
    storedSettings.timeseriesInterval ?? defaultTimeseriesInterval
  );
  const [frameCycle, setFrameCycle] = useState(
    storedSettings.frameCycle ?? defaultFrameCycle
  );
  const [saveToFile, setSaveToFile] = useState(
    storedSettings.saveToFile ?? false
  );
  const [tableSettings, setTableSettings]: [
    TableSetting[],
    Function
  ] = useState(storedSettings.tables);

  const _onTimeSeriesIntervalChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const val = Number(evt.target.value);
    if (isNaN(val)) {
      return;
    }
    setTimeseriesInterval(val);
  };

  const _onFrameCycleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const val = Number(evt.target.value);
    if (isNaN(val)) {
      return;
    }
    setFrameCycle(val);
  }

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
      frameCycle,
      saveToFile,
      tables: tableSettings,
    });
    addToast("Settings saved.", {
      appearance: "success",
      autoDismiss: true,
    });
  }, [timeseriesInterval, frameCycle, saveToFile, tableSettings, storeSettings, addToast]);

  const recordOptions = useMemo(
    () => [
      {
        value: "true",
        label: "Record",
        checked: saveToFile,
        onChange: (evt: ChangeEvent<HTMLInputElement>) =>
          setSaveToFile(evt.target.checked),
      },
      {
        value: "false",
        label: "Do not record",
        checked: !saveToFile,
        onChange: (evt: ChangeEvent<HTMLInputElement>) =>
          setSaveToFile(!evt.target.checked),
      },
    ],
    [saveToFile, setSaveToFile]
  );

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
        <div className="my-3 font-bold">Timeseries interval</div>
        <div>
          <input
            className="border rounded-md p-3"
            type="number"
            value={timeseriesInterval}
            onChange={_onTimeSeriesIntervalChange}
          />
          <span> ms</span>
        </div>
      </div>
      <div className="flex flex-col items-start my-5">
        <div className="my-3 font-bold">Frame cycle</div>
        <div>
          <input
            className="border rounded-md p-3"
            type="number"
            value={frameCycle}
            onChange={_onFrameCycleChange}
          />
          <span> ms</span>
        </div>
      </div>
      <div className="flex flex-col items-start my-5">
        <div className="my-3 font-bold">Record timeseries data for replay</div>
        <RadioGroup options={recordOptions} />
      </div>
      <div className="flex flex-col items-start">
        <div className="my-3 font-bold">Subscribed tables</div>
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

export default memo(Settings);
