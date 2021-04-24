import { memo } from "react";
import { useLocation } from "react-router-dom";
import { Table, TablesBucket } from "types";
import { getLocalStorageItem } from "utils";
import TableSnapshot from "./TableSnapshot";

function Snapshot() {
  const location = useLocation();
  const time = new URLSearchParams(location.search).get("time");
  if (!time) {
    return <div>Time parameter was not specified!</div>;
  }

  const bucket: TablesBucket | undefined = getLocalStorageItem(
    `historicalBucket::${time}`
  );

  if (!bucket) {
    return <div>No entry for this time parameter exists!</div>;
  }

  return (
    <div className="flex flex-col w-full h-full text-left">
      {bucket.table_states.map((tableState: Table) => (
        <TableSnapshot key={tableState.relname} tableData={tableState} />
      ))}
    </div>
  );
}

export default memo(Snapshot);
