export interface Lock {
  locktype?: string;
  mode?: string;
  transactionid?: string;
  virtualtransaction?: string;
  virtualxid?: string;

  locked_row?: string;
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

export interface Table {
  relid: number;
  relname: string;
  processes: Process[];

  start: number;
  end: number;
}

export interface TablesBucket {
  t_start: string;
  t_end: string;
  table_states: Table[];
}
