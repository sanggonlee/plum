import axios from "axios";

export interface Lock {
  lock_type: string;
}

export interface Process {
  datid: number;
  datname: string;
  pid: number;
  leader_pid: number;
  usesysid: number;
  usename: string;
  application_name: string;
  client_addr: string;
  client_hostname: string;
  client_port: number;
  backend_start: string;
  xact_start: string;
  query_start: string;
  state_change: string;
  wait_event_type: string;
  wait_event: string;
  state: string;
  backend_xid: number;
  backend_xmin: number;
  query: string;
  backend_type: string;

  blocked_by: number[];
  locks: Lock[];
}

// export interface Process extends Activity {
//   //pid: string; // PID won't be meaningfully used as a number, so take it as string
//   //activity: Activity;
//   blocked_by: number[];
//   locks: Lock[];

//   //start: number;
//   //end: number;
// }

export interface Table {
  relid: number;
  relname: string;
  processes: Process[];

  start: number;
  end: number;
}

// export interface Bucket {
//   t_start: string;
//   t_end: string;
//   table_states: Table[];
// }

export interface TablesBucket {
  t_start: string;
  t_end: string;
  table_states: Table[];
}

export async function getTables() {
  const resp = await axios.get<Table[]>("http://localhost:8090/user_tables");
  const { data } = resp;
  return data;
}
