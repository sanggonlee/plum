import { WebsocketSource } from "types";

export enum WebsocketSubscriptionType {
  Tables = "Tables",
}

function invalidWebsocketSubscriptionTypeError(
  type: WebsocketSubscriptionType
) {
  return `Invalid websocket subscription type: ${type}`;
}

// WebSocket singleton.
const wsInstances: {
  [type in WebsocketSubscriptionType]?: WebsocketSource;
} = {};

// const wsSubscriptionTypeToUrl = {
//   [WebsocketSubscriptionType.Tables]: "ws://localhost:8090/timeseries",
// };

function getWsSubscriptionUrl(
  type: WebsocketSubscriptionType,
  options: WebsocketOptions
): string {
  switch (type) {
    case WebsocketSubscriptionType.Tables:
      return `ws://localhost:8090/timeseries?${optionsToQueryParams(options)}`;
    default:
      console.error(invalidWebsocketSubscriptionTypeError(type));
      return "";
  }
}

// function getWsSubscriptionBucketTransformer(type: WebsocketSubscriptionType): Function {
//   switch (type) {
//     case WebsocketSubscriptionType.Tables:
//       return (bucket: TablesBucket) => {
//         if (bucket === undefined) {
//           return;
//         }

//         return tablesBucketToMonochronBucket(bucket);
//       };
//     default:
//       console.error(invalidWebsocketSubscriptionTypeError(type));
//       return () => {};
//   }
// }

interface WebsocketOptions {
  interval?: number;
  relations?: string[];
}

export function registerWebsocketSource(
  type: WebsocketSubscriptionType,
  options: WebsocketOptions,
  callback: Function
): WebsocketSource {
  const url = getWsSubscriptionUrl(type, options);
  if (url === "") {
    return new WebsocketSource();
  }

  let websocketSource = getWebsocketSource(type);
  if (websocketSource) {
    if (url === websocketSource.getUrl()) {
      return websocketSource;
    }

    websocketSource.unsubscribe();
    delete wsInstances[type];
  }

  websocketSource = new WebsocketSource(url, callback);
  wsInstances[type] = websocketSource;
  return websocketSource;
}

export function getWebsocketSource(
  type: WebsocketSubscriptionType
): WebsocketSource | undefined {
  if (!wsInstances[type]) {
    return undefined;
  }
  return wsInstances[type];
}

function optionsToQueryParams(options: WebsocketOptions): string {
  const opts = options as any;
  return Object.keys(opts)
    .filter((key) => !!opts[key])
    .map((key) => {
      let val = opts[key];
      if (Array.isArray(val)) {
        val = val.join(",");
      }
      return `${key}=${val}`;
    })
    .join("&");
}

// function tablesBucketToMonochronBucket(bucket: TablesBucket): TopBucket {
//   return {
//     t_start: bucket.t_start,
//     t_end: bucket.t_end,
//     entries: bucket.table_states.map((table: Table) => ({
//       key: table.name,
//       start: 0,
//       end: 0,
//       data: table,
//       buckets: table.processes.map((process: Process) => ({
//         key: process.pid,
//         start: 0,
//         end: 0,
//         data: process,
//         buckets: [],
//       })),
//     })),
//   };
// }
