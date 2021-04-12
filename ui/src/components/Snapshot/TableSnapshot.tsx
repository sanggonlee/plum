import { Process, Table } from "api";

interface TableSnapshotProps {
  tableData: Table;
}

export default function TableSnapshot({ tableData }: TableSnapshotProps) {
  const _formatBlockingPids = (process: Process) => {
    const blockingPids = process.blocked_by;
    return blockingPids?.length ? blockingPids.join(",") : "None";
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
          </div>
        ))}
      </div>
    </div>
  );
}
