import { Lock, Process, Table } from "types";

interface TableSnapshotProps {
  tableData: Table;
}

export default function TableSnapshot({ tableData }: TableSnapshotProps) {
  const _formatBlockingPids = (process: Process) => {
    const blockingPids = process.blocked_by;
    return blockingPids?.length ? blockingPids.join(",") : "None";
  };

  const _formatLockInfo = (lock: Lock, index: number) => {
    return (
      <div key={index} className="flex flex-row mb-5">
        <span className="flex flex-initial w-px border"></span>
        <div className="flex-1">
          <div className="m-1 p-1">Lock type: {lock.locktype}</div>
          <div className="m-1 p-1">Mode: {lock.mode}</div>
          <div className="m-1 p-1">transactionid: {lock.transactionid}</div>
          <div className="m-1 p-1">
            virtualtransaction: {lock.virtualtransaction}
          </div>
          <div className="m-1 p-1">virtualxid: {lock.virtualxid}</div>
          <div className="m-1 p-1">Locked row: {lock.locked_row}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="m-5">
      <div className="font-bold text-xl">{tableData.relname}</div>
      <div>
        {tableData.processes.map((process: Process) => (
          <div
            key={process.pid}
            className="flex flex-col items-start text-left p-3 border-b-2 border-blue-200"
          >
            <div className="m-1 p-1">
              PID:{" "}
              <span className="text-blue-400 font-black">{process.pid}</span>
            </div>
            <div className="m-1 p-1">
              Query
              <div className="p-2 bg-blue-300">{process.query}</div>
            </div>
            <div className="m-1 p-1">
              Blocked by: {_formatBlockingPids(process)}
            </div>
            <div className="m-1 p-1">
              State:{" "}
              <span className="text-blue-400 font-semibold">
                {process.state}
              </span>
            </div>
            <div className="m-1 p-1">Wait event: {process.wait_event}</div>
            <div className="m-1 p-1">
              Wait event type: {process.wait_event_type}
            </div>
            <div className="m-1 p-1">Locks:</div>
            <div className="ml-3 p-1">{process.locks.map(_formatLockInfo)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
